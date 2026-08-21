const Movie = require('../models/Movie')

const createMovie = async (req, res) => {
    const { title, description, genre, durationMinutes, rating, posterUrl } = req.body

    if (!title || !description || !genre || !durationMinutes) {
        return res.status(400).json({ message: 'Missing required movie details' })
    }

    const existingMovie = await Movie.findOne({ title: String(title).trim() })
    if (existingMovie) {
        return res.status(409).json({ message: 'A movie with this title already exists' })
    }

    const movie = await Movie.create({
        title: String(title).trim(),
        description: String(description).trim(),
        genre: Array.isArray(genre) ? genre.map(g => String(g).trim()) : [String(genre).trim()],
        durationMinutes: Number(durationMinutes),
        rating: rating ? String(rating) : 'PG-13',
        posterUrl: posterUrl ? String(posterUrl) : ''
    })

    return res.status(201).json({
        message: 'Movie created successfully',
        movie
    })
}

const getAllMovies = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10))
    const skip = (page - 1) * limit

    const filter = {}
    if (req.query.genre) {
        filter.genre = String(req.query.genre)
    }
    if (req.query.active !== undefined) {
        filter.isActive = req.query.active === 'true'
    }

    const [movies, total] = await Promise.all([
        Movie.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Movie.countDocuments(filter)
    ])

    return res.status(200).json({
        movies,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    })
}

const getMovieById = async (req, res) => {
    const movie = await Movie.findById(req.params.id).lean()
    if (!movie) {
        return res.status(404).json({ message: 'Movie not found' })
    }

    return res.status(200).json({ movie })
}

const updateMovie = async (req, res) => {
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
        return res.status(404).json({ message: 'Movie not found' })
    }

    return res.status(200).json({
        message: 'Movie updated successfully',
        movie
    })
}

const deleteMovie = async (req, res) => {
    const movie = await Movie.findByIdAndDelete(req.params.id)
    if (!movie) {
        return res.status(404).json({ message: 'Movie not found' })
    }

    return res.status(200).json({ message: 'Movie deleted successfully' })
}

const addShowtime = async (req, res) => {
    const { startTime, screenNumber, availableSeats, ticketPrice } = req.body

    if (!startTime || !screenNumber || !availableSeats || !ticketPrice) {
        return res.status(400).json({ message: 'Missing showtime details' })
    }

    const movie = await Movie.findById(req.params.id)
    if (!movie) {
        return res.status(404).json({ message: 'Movie not found' })
    }

    movie.showtimes.push({
        startTime: new Date(startTime),
        screenNumber: Number(screenNumber),
        availableSeats: Number(availableSeats),
        ticketPrice: Number(ticketPrice)
    })

    await movie.save()

    return res.status(201).json({
        message: 'Showtime added successfully',
        movie
    })
}

const removeShowtime = async (req, res) => {
    const { id, showtimeId } = req.params

    const movie = await Movie.findById(id)
    if (!movie) {
        return res.status(404).json({ message: 'Movie not found' })
    }

    movie.showtimes = movie.showtimes.filter(st => st._id.toString() !== showtimeId)
    await movie.save()

    return res.status(200).json({
        message: 'Showtime removed successfully',
        movie
    })
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