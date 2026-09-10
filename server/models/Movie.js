const mongoose = require("mongoose")

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Movie title is required"],
            trim: true
        },
        description: {
            type: String,
            required: [true, "Movie description is required"],
            trim: true
        },
        genre: {
            type: [String],
            required: [true, "At least one genre is required"],
            index: true
        },
        durationMinutes: {
            type: Number,
            required: [true, "Movie duration is required"],
            min: [1, "Duration must be at least 1 minute"],
            max: [600, "Duration cannot exceed 600 minutes"]
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

const Movie = mongoose.models.Movie || mongoose.model("Movie", movieSchema)

module.exports = Movie