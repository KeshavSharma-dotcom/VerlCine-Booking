const mongoose = require("mongoose")

const seatSchema = new mongoose.Schema(
    {
        seatNumber: {
            type: String,
            required: [true, "Seat number is required"],
            trim: true
        },
        row: {
            type: Number,
            required: [true, "Row coordinate is required"],
            min: 0
        },
        col: {
            type: Number,
            required: [true, "Col coordinate is required"],
            min: 0
        },
        tier: {
            type: String,
            required: [true, "Seat tier is required"],
            trim: true,
            default: "Gold"
        },
        price: {
            type: Number,
            required: [true, "Seat price is required"],
            min: [0, "Seat price cannot be negative"]
        },
        status: {
            type: String,
            enum: ["available", "locked", "booked", "blocked"],
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

const tierPriceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Tier name is required"],
            trim: true
        },
        price: {
            type: Number,
            required: [true, "Tier price is required"],
            min: [0, "Tier price cannot be negative"]
        }
    },
    { _id: false }
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
        layout: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ScreenLayout",
            default: null
        },
        startTime: {
            type: Date,
            required: [true, "Start time is required"]
        },
        endTime: {
            type: Date,
            required: [true, "End time is required"]
        },
        tierPricing: {
            type: [tierPriceSchema],
            default: []
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
showtimeSchema.index({ theatre: 1, screenNumber: 1, startTime: 1, endTime: 1 })
showtimeSchema.index({ "seats.seatNumber": 1, "seats.status": 1 })
showtimeSchema.index({ "seats.status": 1, "seats.lockedUntil": 1 })

const Showtime = mongoose.models.Showtime || mongoose.model("Showtime", showtimeSchema)

module.exports = Showtime