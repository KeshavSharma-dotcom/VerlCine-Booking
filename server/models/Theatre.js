const mongoose = require("mongoose")

const screenSchema = new mongoose.Schema(
    {
        screenNumber: {
            type: Number,
            required: [true, "Screen number is required"]
        },
        totalSeats: {
            type: Number,
            required: [true, "Total seats count is required"]
        }
    },
    { _id: false }
)

const theatreSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Theatre name is required"],
            trim: true
        },
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true
        },
        address: {
            type: String,
            required: [true, "Street address is required"],
            trim: true
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number],
                required: [true, "Coordinates [longitude, latitude] are required"]
            }
        },
        osmId: {
            type: String,
            default: null,
            trim: true
        },
        osmType: {
            type: String,
            enum: ["node", "way", "relation", null],
            default: null
        },
        tags: {
            type: Map,
            of: String,
            default: {}
        },
        screens: {
            type: [screenSchema],
            default: []
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
)

theatreSchema.index({ location: "2dsphere" })
theatreSchema.index({ osmId: 1 }, { unique: true, sparse: true })
theatreSchema.index({ city: 1, isActive: 1 })

const Theatre = mongoose.models.Theatre || mongoose.model("Theatre", theatreSchema)

module.exports = Theatre