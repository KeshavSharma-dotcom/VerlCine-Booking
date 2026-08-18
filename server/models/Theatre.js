const mongoose = require("mongoose")

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
            required: true,
            index: true
        },
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true,
            index: true
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true
        },
        screens: [
            {
                screenNumber: {
                    type: Number,
                    required: true
                },
                totalSeats: {
                    type: Number,
                    required: true,
                    default: 100
                }
            }
        ],
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
)

const Theatre = mongoose.model("Theatre", theatreSchema)
module.exports = Theatre