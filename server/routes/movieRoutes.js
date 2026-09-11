const express = require("express")
const router = express.Router()

const {
    createMovie,
    getAllMovies,
    getMovieById,
    updateMovie,
    deleteMovie,
    addShowtime,
    removeShowtime
} = require("../controller/movieController")

const { verifyToken } = require("../middleware/verifyToken")
const { requireRole, requireTheatreAccess } = require("../middleware/verifyRole")

router.get("/", getAllMovies)
router.get("/:id", getMovieById)

router.post("/", verifyToken, requireRole("admin", "theatre-admin"), createMovie)
router.put("/:id", verifyToken, requireRole("admin", "theatre-admin"), updateMovie)
router.delete("/:id", verifyToken, requireRole("admin"), deleteMovie)

router.post("/:id/showtimes", verifyToken, requireTheatreAccess, addShowtime)
router.delete("/:id/showtimes/:showtimeId", verifyToken, requireTheatreAccess, removeShowtime)

module.exports = router