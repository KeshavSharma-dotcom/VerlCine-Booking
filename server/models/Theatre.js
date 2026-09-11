const mongoose = require("mongoose")

const screenSchema = new mongoose.Schema(
    {
        screenNumber: {
            type: Number,
            required: [true, "Screen number is required"],
            min: [1, "Screen number must be at least 1"]
        },
        totalSeats: {
            type: Number,
            required: [true, "Total seats are required"],
            min: [1, "Screen must have at least 1 seat"],
            default: 100
        }
    },
    { _id: false }
)

const theatreSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Theatre name is required"],
            trim: true,
            index: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Theatre owner is required"],
            index: true
        },
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true
        },
        screens: {
            type: [screenSchema],
            validate: {
                validator: (screens) => Array.isArray(screens) && screens.length > 0,
                message: "At least one screen is required"
            }
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

theatreSchema.index({ city: 1, isActive: 1 })
theatreSchema.index({ owner: 1, isActive: 1 })
theatreSchema.index({ name: "text", city: "text", address: "text" })

theatreSchema.virtual("showtimes", {
    ref: "Showtime",
    localField: "_id",
    foreignField: "theatre"
})

const Theatre = mongoose.models.Theatre || mongoose.model("Theatre", theatreSchema)

module.exports = Theatre