const mongoose = require("mongoose")

const seatSchema = new mongoose.Schema(
    {
        seatNumber: {
            type: String,
            required: true,
            trim: true
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
    { _id: true }
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
            ref: "Theatre",
            required: true
        },
        screenNumber: {
            type: Number,
            required: true,
            min: 1
        },
        startTime: {
            type: Date,
            required: true
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
showtimeSchema.index({ theatre: 1, screenNumber: 1, startTime: 1 })
showtimeSchema.index({ "seats.seatNumber": 1, "seats.status": 1 })
showtimeSchema.index({ "seats.status": 1, "seats.lockedUntil": 1 })

const Showtime = mongoose.models.Showtime || mongoose.model("Showtime", showtimeSchema)

module.exports = Showtime