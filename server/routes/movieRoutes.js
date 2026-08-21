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
} = require('../controller/movieController')

const verifyToken = require('../middleware/verifyToken')
const { requireRole } = require('../middleware/verifyRole')

router.get('/', verifyToken, getAllMovies)
router.get('/:id', verifyToken, getMovieById)
router.post('/', verifyToken, requireRole('admin'), createMovie)
router.put('/:id', verifyToken, requireRole('admin'), updateMovie)
router.delete('/:id', verifyToken, requireRole('admin'), deleteMovie)
router.post('/:id/showtimes', verifyToken, requireRole('admin'), addShowtime)
router.delete('/:id/showtimes/:showtimeId', verifyToken, requireRole('admin'), removeShowtime)

module.exports = router