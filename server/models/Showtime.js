const mongoose = require("mongoose")

const seatSchema = new mongoose.Schema(
    {
        seatNumber: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["available", "locked", "booked"],
            default: "available"
        },
        lockedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        lockedUntil: {
            type: Date,
            default: null
        }
    },
    { _id: false }
)

const showtimeSchema = new mongoose.Schema(
    {
        movie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Movie",
            required: true
        },
        theatre: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        startTime: {
            type: Date,
            required: true
        },
        ticketPrice: {
            type: Number,
            required: true
        },
        seats: [seatSchema]
    },
    { timestamps: true }
)

const Showtime = mongoose.model("Showtime", showtimeSchema)

module.exports = Showtime