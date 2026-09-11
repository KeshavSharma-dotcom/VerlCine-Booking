const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            index: true
        },
        showtime: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Showtime",
            required: [true, "Showtime reference is required"],
            index: true
        },
        seatsBooked: {
            type: [String],
            required: [true, "At least one seat must be selected"],
            validate: {
                validator: (seats) => Array.isArray(seats) && seats.length > 0,
                message: "Seats booked cannot be empty"
            }
        },
        totalAmount: {
            type: Number,
            required: [true, "Total amount is required"],
            min: [0, "Total amount cannot be negative"]
        },
        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            default: null
        },
        qrCodeData: {
            type: String,
            default: ""
        },
        reminderSent: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "pending",
            index: true
        }
    },
    { timestamps: true }
)

bookingSchema.index({ user: 1, createdAt: -1 })
bookingSchema.index({ showtime: 1, status: 1 })
bookingSchema.index({ reminderSent: 1, status: 1 })

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema)

module.exports = Booking