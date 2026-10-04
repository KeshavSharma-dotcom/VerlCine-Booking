const Movie = require("../models/Movie")
const Showtime = require("../models/Showtime")
const Theatre = require("../models/Theatre")

const createMovie = async (req, res, next) => {
    try {
        const {
            title,
            description,
            genre,
            durationMinutes,
            rating,
            posterUrl,
            director,
            writer,
            cast,
            language,
            boxOffice,
            awards,
            theatreId
        } = req.body

        if (!title || !description || !genre || !durationMinutes) {
            return res.status(400).json({ success: false, message: "Missing required movie details" })
        }

        if (req.user.role === "theatre-admin") {
            if (!theatreId) {
                return res.status(400).json({ success: false, message: "theatreId is required for theatre-admin" })
            }
            const theatre = await Theatre.findById(theatreId)
            if (!theatre || theatre.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: "You can only create movie sessions for your own theatre" })
            }
        }

        const existingMovie = await Movie.findOne({ title: String(title).trim() })
        if (existingMovie) {
            return res.status(409).json({ success: false, message: "A movie with this title already exists" })
        }

        const movie = await Movie.create({
            title: String(title).trim(),
            description: String(description).trim(),
            genre: Array.isArray(genre) ? genre.map((g) => String(g).trim()) : [String(genre).trim()],
            durationMinutes: Number(durationMinutes),
            rating: rating ? String(rating) : "PG-13",
            posterUrl: posterUrl ? String(posterUrl) : "",
            director: director ? String(director).trim() : "",
            writer: writer ? String(writer).trim() : "",
            cast: Array.isArray(cast) ? cast.map((c) => String(c).trim()) : typeof cast === "string" ? cast.split(",").map((c) => c.trim()) : [],
            language: language ? String(language).trim() : "English",
            boxOffice: boxOffice ? String(boxOffice).trim() : "",
            awards: awards ? String(awards).trim() : ""
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

        if (req.query.theatreId) {
            const showtimes = await Showtime.find({ theatre: req.query.theatreId }).select("movie").lean()
            const movieIds = showtimes.map((st) => st.movie)
            filter._id = { $in: movieIds }
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
                populate: { path: "theatre", select: "name city address screens owner" }
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
        const {
            title,
            description,
            genre,
            durationMinutes,
            rating,
            posterUrl,
            director,
            writer,
            cast,
            language,
            boxOffice,
            awards,
            isActive
        } = req.body

        if (req.user.role === "theatre-admin") {
            const activeShowtimes = await Showtime.find({ movie: req.params.id }).populate("theatre")
            const ownsAtLeastOne = activeShowtimes.some((st) => st.theatre && st.theatre.owner.toString() === req.user._id.toString())

            if (!ownsAtLeastOne) {
                return res.status(403).json({ success: false, message: "Forbidden. You have no active showtimes for this movie in your theatres" })
            }
        }

        const updateFields = {}
        if (title !== undefined) updateFields.title = String(title).trim()
        if (description !== undefined) updateFields.description = String(description).trim()
        if (genre !== undefined) updateFields.genre = Array.isArray(genre) ? genre.map((g) => String(g).trim()) : [String(genre).trim()]
        if (durationMinutes !== undefined) updateFields.durationMinutes = Number(durationMinutes)
        if (rating !== undefined) updateFields.rating = String(rating)
        if (posterUrl !== undefined) updateFields.posterUrl = String(posterUrl)
        if (director !== undefined) updateFields.director = String(director).trim()
        if (writer !== undefined) updateFields.writer = String(writer).trim()
        if (cast !== undefined) updateFields.cast = Array.isArray(cast) ? cast.map((c) => String(c).trim()) : typeof cast === "string" ? cast.split(",").map((c) => c.trim()) : []
        if (language !== undefined) updateFields.language = String(language).trim()
        if (boxOffice !== undefined) updateFields.boxOffice = String(boxOffice).trim()
        if (awards !== undefined) updateFields.awards = String(awards).trim()
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

        const parsedStartTime = new Date(startTime)
        if (isNaN(parsedStartTime.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid showtime start format" })
        }

        const [movie, theatre] = await Promise.all([
            Movie.findById(movieId),
            Theatre.findById(theatreId)
        ])

        if (!movie) {
            return res.status(404).json({ success: false, message: "Movie not found" })
        }

        if (!theatre) {
            return res.status(404).json({ success: false, message: "Theatre not found" })
        }

        const seatCount = Number(totalSeats) || 60
        const basePrice = Number(ticketPrice)
        const seats = []
        const seatsPerRow = 10
        const totalRows = Math.ceil(seatCount / seatsPerRow)

        for (let r = 0; r < totalRows; r++) {
            const rowChar = String.fromCharCode(65 + r)
            const isRecliner = r >= totalRows - 2
            const isExecutive = r < 2
            const tier = isRecliner ? "RECLINER" : isExecutive ? "EXECUTIVE" : "PREMIUM"
            const seatPrice = isRecliner ? basePrice + 150 : isExecutive ? basePrice - 50 : basePrice

            for (let c = 1; c <= seatsPerRow; c++) {
                if (seats.length >= seatCount) break
                seats.push({
                    seatNumber: `${rowChar}${c}`,
                    row: r,
                    col: c,
                    tier,
                    price: seatPrice,
                    status: "available",
                    lockedBy: null,
                    lockedUntil: null
                })
            }
        }

        const showtime = await Showtime.create({
            movie: movieId,
            theatre: theatreId,
            screenNumber: Number(screenNumber),
            startTime: parsedStartTime,
            ticketPrice: basePrice,
            tierPricing: [
                { name: "EXECUTIVE", price: basePrice - 50 },
                { name: "PREMIUM", price: basePrice },
                { name: "RECLINER", price: basePrice + 150 }
            ],
            seats
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