const mongoose = require('mongoose')

const showtimeSchema = new mongoose.Schema(
    {
        startTime: {
            type: Date,
            required: true
        },
        screenNumber: {
            type: Number,
            required: true,
            min: 1
        },
        availableSeats: {
            type: Number,
            required: true,
            min: 0
        },
        ticketPrice: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { _id: true }
)

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
            enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
            default: 'PG-13'
        },
        posterUrl: {
            type: String,
            default: ''
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        showtimes: [showtimeSchema]
    },
    { timestamps: true }
)

movieSchema.index({ title: 'text', description: 'text' })

const Movie = mongoose.model('Movie', movieSchema)
module.exports = Movie