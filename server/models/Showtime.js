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
            required: true,
            index: true
        },
        theatre: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Theatre",
            required: true,
            index: true
        },
        screenNumber: {
            type: Number,
            required: true
        },
        startTime: {
            type: Date,
            required: true,
            index: true
        },
        ticketPrice: {
            type: Number,
            required: true,
            min: 0
        },
        seats: [seatSchema]
    },
    { timestamps: true }
)

showtimeSchema.index({ movie: 1, theatre: 1, startTime: 1 })

const Showtime = mongoose.model("Showtime", showtimeSchema)
module.exports = Showtime