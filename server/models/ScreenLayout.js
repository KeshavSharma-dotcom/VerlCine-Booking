const mongoose = require("mongoose")

const layoutCellSchema = new mongoose.Schema(
    {
        row: {
            type: Number,
            required: true
        },
        col: {
            type: Number,
            required: true
        },
        seatNumber: {
            type: String,
            trim: true,
            default: ""
        },
        type: {
            type: String,
            enum: ["seat", "aisle", "empty", "wheelchair"],
            default: "seat"
        },
        tier: {
            type: String,
            trim: true,
            default: "Gold"
        }
    },
    { _id: false }
)

const screenLayoutSchema = new mongoose.Schema(
    {
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
        layoutName: {
            type: String,
            required: true,
            trim: true,
            default: "Standard Audi"
        },
        totalRows: {
            type: Number,
            required: true,
            min: 1
        },
        totalCols: {
            type: Number,
            required: true,
            min: 1
        },
        tiers: [
            {
                name: {
                    type: String,
                    required: true,
                    trim: true
                },
                defaultPrice: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],
        grid: [layoutCellSchema],
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
)

screenLayoutSchema.index({ theatre: 1, screenNumber: 1 }, { unique: true })

const ScreenLayout = mongoose.models.ScreenLayout || mongoose.model("ScreenLayout", screenLayoutSchema)

module.exports = ScreenLayout