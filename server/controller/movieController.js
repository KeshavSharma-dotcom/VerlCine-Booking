const Movie = require("../models/Movie")
const Showtime = require("../models/Showtime")

const createMovie = async (req, res, next) => {
    try {
        const { title, description, genre, durationMinutes, rating, posterUrl } = req.body

        if (!title || !description || !genre || !durationMinutes) {
            return res.status(400).json({ success: false, message: "Missing required movie details" })
        }

        const existingMovie = await Movie.findOne({ title: String(title).trim() })
        if (existingMovie) {
            return res.status(409).json({ success: false, message: "A movie with this title already exists" })
        }

        const movie = await Movie.create({
            title: String(title).trim(),
            description: String(description).trim(),
            genre: Array.isArray(genre) ? genre.map(g => String(g).trim()) : [String(genre).trim()],
            durationMinutes: Number(durationMinutes),
            rating: rating ? String(rating) : "PG-13",
            posterUrl: posterUrl ? String(posterUrl) : ""
        })

        res.status(201).json({
            success: true,
            message: "Movie created successfully",
            movie
        })
    } catch (err) {
        next(err)
    }
}

const getAllMovies = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1)
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10))
        const skip = (page - 1) * limit

        const filter = {}
        if (req.query.genre) {
            filter.genre = String(req.query.genre)
        }
        if (req.query.active !== undefined) {
            filter.isActive = req.query.active === "true"
        }

        const [movies, total] = await Promise.all([
            Movie.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Movie.countDocuments(filter)
        ])

        res.status(200).json({
            success: true,
            movies,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (err) {
        next(err)
    }
}

const getMovieById = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id)
            .populate({
                path: "showtimes",
                populate: { path: "theatre", select: "name location" }
            })
            .lean()

        if (!movie) {
            return res.status(404).json({ success: false, message: "Movie not found" })
        }

        res.status(200).json({ success: true, movie })
    } catch (err) {
        next(err)
    }
}

const updateMovie = async (req, res, next) => {
    try {
        const { title, description, genre, durationMinutes, rating, posterUrl, isActive } = req.body

        const updateFields = {}
        if (title !== undefined) updateFields.title = String(title).trim()
        if (description !== undefined) updateFields.description = String(description).trim()
        if (genre !== undefined) updateFields.genre = Array.isArray(genre) ? genre.map(g => String(g).trim()) : [String(genre).trim()]
        if (durationMinutes !== undefined) updateFields.durationMinutes = Number(durationMinutes)
        if (rating !== undefined) updateFields.rating = String(rating)
        if (posterUrl !== undefined) updateFields.posterUrl = String(posterUrl)
        if (isActive !== undefined) updateFields.isActive = Boolean(isActive)

        const movie = await Movie.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        )

        if (!movie) {
            return res.status(404).json({ success: false, message: "Movie not found" })
        }

        res.status(200).json({
            success: true,
            message: "Movie updated successfully",
            movie
        })
    } catch (err) {
        next(err)
    }
}

const deleteMovie = async (req, res, next) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id)
        if (!movie) {
            return res.status(404).json({ success: false, message: "Movie not found" })
        }

        await Showtime.deleteMany({ movie: req.params.id })

        res.status(200).json({ success: true, message: "Movie deleted successfully" })
    } catch (err) {
        next(err)
    }
}

const addShowtime = async (req, res, next) => {
    try {
        const { theatreId, startTime, screenNumber, ticketPrice, totalSeats } = req.body
        const movieId = req.params.id

        if (!theatreId || !startTime || !screenNumber || !ticketPrice) {
            return res.status(400).json({ success: false, message: "Missing showtime details" })
        }

        const movie = await Movie.findById(movieId)
        if (!movie) {
            return res.status(404).json({ success: false, message: "Movie not found" })
        }

        const seatCount = Number(totalSeats) || 50
        const generatedSeats = Array.from({ length: seatCount }, (_, idx) => ({
            seatNumber: `${String.fromCharCode(65 + Math.floor(idx / 10))}${(idx % 10) + 1}`,
            status: "available",
            lockedBy: null,
            lockedUntil: null
        }))

        const showtime = await Showtime.create({
            movie: movieId,
            theatre: theatreId,
            screenNumber: Number(screenNumber),
            startTime: new Date(startTime),
            ticketPrice: Number(ticketPrice),
            seats: generatedSeats
        })

        res.status(201).json({
            success: true,
            message: "Showtime added successfully",
            showtime
        })
    } catch (err) {
        next(err)
    }
}

const removeShowtime = async (req, res, next) => {
    try {
        const { showtimeId } = req.params

        const showtime = await Showtime.findByIdAndDelete(showtimeId)
        if (!showtime) {
            return res.status(404).json({ success: false, message: "Showtime not found" })
        }

        res.status(200).json({
            success: true,
            message: "Showtime removed successfully"
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    createMovie,
    getAllMovies,
    getMovieById,
    updateMovie,
    deleteMovie,
    addShowtime,
    removeShowtime
}