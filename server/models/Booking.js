const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        showtime: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Showtime",
            required: true
        },
        seatsBooked: [
            {
                type: String,
                required: true
            }
        ],
        totalAmount: {
            type: Number,
            required: true
        },
        qrCodeData: {
            type: String,
            required: true
        },
        reminderSent: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ["confirmed", "cancelled"],
            default: "confirmed"
        }
    },
    { timestamps: true }
)

const Booking = mongoose.model("Booking", bookingSchema)

module.exports = Booking