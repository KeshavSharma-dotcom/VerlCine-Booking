const crypto = require("crypto")
const Razorpay = require("razorpay")
const QRCode = require("qrcode")
const Booking = require("../models/Booking")
const Payment = require("../models/Payment")
const Showtime = require("../models/Showtime")

const razorpay = new Razorpay({
    key_id: process.env.RAZOR_API_KEY,
    key_secret: process.env.RAZOR_SECRET
})

const createBookingOrder = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?._id
        const { showtimeId, seatsBooked } = req.body

        if (!showtimeId || !Array.isArray(seatsBooked) || seatsBooked.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Showtime and at least one seat are required"
            })
        }

        const showtime = await Showtime.findById(showtimeId).populate("movie", "title")
        if (!showtime) {
            return res.status(404).json({ success: false, message: "Showtime not found" })
        }

        const now = new Date()
        let calculatedTotal = 0

        for (const seatNum of seatsBooked) {
            const seat = showtime.seats.find((s) => s.seatNumber === seatNum)
            if (!seat) {
                return res.status(400).json({
                    success: false,
                    message: `Seat ${seatNum} does not exist in this showtime`
                })
            }

            const isLockedByAnother =
                seat.status === "locked" &&
                seat.lockedBy &&
                seat.lockedBy.toString() !== userId.toString() &&
                seat.lockedUntil &&
                seat.lockedUntil > now

            if (seat.status === "booked" || isLockedByAnother) {
                return res.status(409).json({
                    success: false,
                    message: `Seat ${seatNum} is no longer available`
                })
            }

            const seatPrice = seat.price || showtime.ticketPrice || 0
            calculatedTotal += seatPrice
        }

        if (calculatedTotal <= 0) {
            return res.status(400).json({
                success: false,
                message: "Calculated amount must be greater than 0"
            })
        }

        const booking = await Booking.create({
            user: userId,
            showtime: showtime._id,
            movie: showtime.movie._id,
            seatsBooked,
            totalAmount: calculatedTotal,
            status: "pending"
        })

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(calculatedTotal * 100),
            currency: "INR",
            receipt: `rcpt_${booking._id.toString().slice(-10)}`,
            notes: {
                bookingId: booking._id.toString(),
                userId: userId.toString()
            }
        })

        const payment = await Payment.create({
            booking: booking._id,
            user: userId,
            amount: calculatedTotal,
            currency: "INR",
            gateway: "razorpay",
            paymentMethod: "upi",
            orderId: razorpayOrder.id,
            status: "pending"
        })

        booking.payment = payment._id
        await booking.save()

        const lockExpiry = new Date(Date.now() + 10 * 60 * 1000)
        await Showtime.updateOne(
            { _id: showtime._id },
            {
                $set: {
                    "seats.$[elem].status": "locked",
                    "seats.$[elem].lockedBy": userId,
                    "seats.$[elem].lockedUntil": lockExpiry
                }
            },
            {
                arrayFilters: [{ "elem.seatNumber": { $in: seatsBooked } }]
            }
        )

        res.status(201).json({
            success: true,
            message: "Razorpay order initialized successfully",
            bookingId: booking._id,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZOR_API_KEY
        })
    } catch (err) {
        next(err)
    }
}

const verifyBookingPayment = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?._id
        const {
            bookingId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            paymentMethod,
            upiApp
        } = req.body

        if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification parameters"
            })
        }

        const booking = await Booking.findById(bookingId).populate("payment")
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking record not found" })
        }

        if (booking.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized booking access" })
        }

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZOR_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex")

        const isSignatureValid = crypto.timingSafeEqual(
            Buffer.from(generatedSignature),
            Buffer.from(razorpay_signature)
        )

        if (!isSignatureValid) {
            await Payment.findByIdAndUpdate(booking.payment?._id, {
                status: "failed",
                transactionId: razorpay_payment_id,
                paymentSignature: razorpay_signature
            })

            return res.status(400).json({
                success: false,
                message: "Payment signature mismatch. Verification failed."
            })
        }

        const qrPayload = JSON.stringify({
            bookingId: booking._id.toString(),
            userId: userId.toString(),
            seats: booking.seatsBooked,
            totalAmount: booking.totalAmount,
            txId: razorpay_payment_id
        })
        const qrCodeDataUrl = await QRCode.toDataURL(qrPayload)

        booking.status = "confirmed"
        booking.qrCodeData = qrCodeDataUrl
        await booking.save()

        const allowedMethods = ["upi", "card", "netbanking", "wallet"]
        const sanitizedMethod = allowedMethods.includes(paymentMethod) ? paymentMethod : "upi"

        await Payment.findByIdAndUpdate(booking.payment?._id, {
            status: "completed",
            transactionId: razorpay_payment_id,
            paymentSignature: razorpay_signature,
            paymentMethod: sanitizedMethod,
            upiApp: upiApp || null
        })

        await Showtime.updateOne(
            { _id: booking.showtime },
            {
                $set: {
                    "seats.$[elem].status": "booked",
                    "seats.$[elem].lockedBy": userId,
                    "seats.$[elem].lockedUntil": null
                }
            },
            {
                arrayFilters: [{ "elem.seatNumber": { $in: booking.seatsBooked } }]
            }
        )

        const confirmedBooking = await Booking.findById(booking._id)
            .populate("movie", "title posterUrl durationMinutes rating genre")
            .populate("showtime")
            .populate("payment")

        res.status(200).json({
            success: true,
            message: "Payment verified and booking confirmed",
            booking: confirmedBooking
        })
    } catch (err) {
        next(err)
    }
}

const getUserBookings = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?._id
        const page = Math.max(1, parseInt(req.query.page, 10) || 1)
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10))
        const skip = (page - 1) * limit

        const filter = { user: userId }
        if (req.query.status) {
            filter.status = req.query.status
        }

        const [bookings, total] = await Promise.all([
            Booking.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("movie", "title posterUrl durationMinutes rating")
                .populate({
                    path: "showtime",
                    select: "startTime screenNumber theatre",
                    populate: { path: "theatre", select: "name city address" }
                })
                .populate("payment", "amount currency gateway paymentMethod transactionId status")
                .lean(),
            Booking.countDocuments(filter)
        ])

        res.status(200).json({
            success: true,
            bookings,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (err) {
        next(err)
    }
}

const getBookingById = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?._id
        const booking = await Booking.findById(req.params.id)
            .populate("movie", "title posterUrl durationMinutes rating genre")
            .populate({
                path: "showtime",
                select: "startTime screenNumber theatre ticketPrice",
                populate: { path: "theatre", select: "name city address" }
            })
            .populate("payment")
            .lean()

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" })
        }

        if (booking.user.toString() !== userId.toString() && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized access" })
        }

        res.status(200).json({ success: true, booking })
    } catch (err) {
        next(err)
    }
}

const cancelBooking = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?._id
        const booking = await Booking.findById(req.params.id)

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" })
        }

        if (booking.user.toString() !== userId.toString() && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized access" })
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({ success: false, message: "Booking is already cancelled" })
        }

        booking.status = "cancelled"
        await booking.save()

        await Showtime.updateOne(
            { _id: booking.showtime },
            {
                $set: {
                    "seats.$[elem].status": "available",
                    "seats.$[elem].lockedBy": null,
                    "seats.$[elem].lockedUntil": null
                }
            },
            {
                arrayFilters: [{ "elem.seatNumber": { $in: booking.seatsBooked } }]
            }
        )

        res.status(200).json({
            success: true,
            message: "Booking cancelled and seats released successfully"
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    createBookingOrder,
    verifyBookingPayment,
    getUserBookings,
    getBookingById,
    cancelBooking
}