const mongoose = require("mongoose")

const seatSchema = new mongoose.Schema(
    {
        seatNumber: {
            type: String,
            required: [true, "Seat number is required"],
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
            required: [true, "Movie reference is required"]
        },
        theatre: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Theatre",
            required: [true, "Theatre reference is required"]
        },
        screenNumber: {
            type: Number,
            required: [true, "Screen number is required"],
            min: [1, "Screen number must be at least 1"]
        },
        startTime: {
            type: Date,
            required: [true, "Start time is required"]
        },
        ticketPrice: {
            type: Number,
            required: [true, "Ticket price is required"],
            min: [0, "Ticket price cannot be negative"]
        },
        seats: {
            type: [seatSchema],
            validate: {
                validator: (seats) => Array.isArray(seats) && seats.length > 0,
                message: "Showtime must include seat configuration"
            }
        }
    },
    { timestamps: true }
)

showtimeSchema.index({ movie: 1, theatre: 1, startTime: 1 })
showtimeSchema.index({ theatre: 1, screenNumber: 1, startTime: 1 }, { unique: true })
showtimeSchema.index({ "seats.status": 1, "seats.lockedUntil": 1 })

const Showtime = mongoose.models.Showtime || mongoose.model("Showtime", showtimeSchema)

module.exports = Showtime