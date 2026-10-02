const mongoose = require("mongoose")

const seatSchema = new mongoose.Schema(
    {
        showtime: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Showtime",
            required: [true, "Showtime reference is required"],
            index: true
        },
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
            required: [true, "Column coordinate is required"],
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
            enum: ["available", "locked", "booked"],
            default: "available",
            index: true
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
    { timestamps: true }
)

seatSchema.index({ showtime: 1, seatNumber: 1 }, { unique: true })
seatSchema.index({ showtime: 1, status: 1 })
seatSchema.index({ status: 1, lockedUntil: 1 })

const Seat = mongoose.models.Seat || mongoose.model("Seat", seatSchema)

module.exports = Seat