const Booking = require("../models/Booking")

const everythingTotal = async (req, res, next) => {
    try {
        const bookingMetrics = await Booking.aggregate([
            {
                $match: {
                    status: "confirmed"
                }
            },
            {
                $group: {
                    _id: null,
                    totalGMW: { $sum: "$totalAmount" },
                    seatCount: { $sum: "$seatsBooked" }
                }
            }
        ])
        const total = bookingMetrics[0].totalGMW
        const totalSeats = bookingMetrics[0].seatCount
        if (!bookingMetrics.length == 0) {
            total = bookingMetrics[0].totalGMW
            const totalSeats = bookingMetrics[0].seatCount
        }

    } catch (err) {
        next(err)
    }
}