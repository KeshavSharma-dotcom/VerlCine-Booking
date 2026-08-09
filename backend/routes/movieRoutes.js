const express = require('express')
const router = express.Router()

const {
    createMovie,
    getAllMovies,
    getMovieById,
    updateMovie,
    deleteMovie,
    addShowtime,
    removeShowtime
} = require('../controllers/movieController')

const { authenticateToken } = require('../middlewares/authMiddleware')
const { requireRole } = require('../middlewares/roleMiddleware')

router.get('/', authenticateToken, getAllMovies)
router.get('/:id', authenticateToken, getMovieById)
router.post('/', authenticateToken, requireRole('admin'), createMovie)
router.put('/:id', authenticateToken, requireRole('admin'), updateMovie)
router.delete('/:id', authenticateToken, requireRole('admin'), deleteMovie)
router.post('/:id/showtimes', authenticateToken, requireRole('admin'), addShowtime)
router.delete('/:id/showtimes/:showtimeId', authenticateToken, requireRole('admin'), removeShowtime)

module.exports = router