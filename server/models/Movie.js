const mongoose = require("mongoose")

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        genre: {
            type: [String],
            required: true,
            index: true
        },
        durationMinutes: {
            type: Number,
            required: true,
            min: 1
        },
        rating: {
            type: String,
            enum: ["G", "PG", "PG-13", "R", "NC-17"],
            default: "PG-13"
        },
        posterUrl: {
            type: String,
            default: ""
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

movieSchema.index({ title: "text", description: "text" })

movieSchema.virtual("showtimes", {
    ref: "Showtime",
    localField: "_id",
    foreignField: "movie"
})

const Movie = mongoose.model("Movie", movieSchema)
module.exports = Movie