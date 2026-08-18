const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        showtime: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Showtime',
            required: true,
            index: true
        },
        seatsBooked: [
            {
                type: String,
                required: true
            }
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment',
            default: null
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
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'pending'
        }
    },
    { timestamps: true }
)

const Booking = mongoose.model('Booking', bookingSchema)
module.exports = Booking