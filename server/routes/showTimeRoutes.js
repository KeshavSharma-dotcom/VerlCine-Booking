const express = require("express")
const router = express.Router()
const Showtime = require("../models/Showtime")
const Theatre = require("../models/Theatre")

const generateSeats = (totalSeats) => {
    return Array.from({ length: totalSeats }, (_, idx) => ({
        seatNumber: `${String.fromCharCode(65 + Math.floor(idx / 10))}${(idx % 10) + 1}`,
        status: "available",
        lockedBy: null,
        lockedUntil: null
    }))
}

router.get("/:id", async (req, res, next) => {
    try {
        const showtime = await Showtime.findById(req.params.id)
            .populate("movie", "title posterUrl durationMinutes rating genre")
            .populate("theatre", "name address city screens")

        if (!showtime) {
            return res.status(404).json({ success: false, message: "Showtime not found" })
        }

        res.status(200).json({ success: true, showtime })
    } catch (err) {
        next(err)
    }
})

router.post("/", async (req, res, next) => {
    try {
        const { movieId, theatreId, screenNumber, startTime, ticketPrice } = req.body

        if (!movieId || !theatreId || !startTime || !ticketPrice) {
            return res.status(400).json({ success: false, message: "Missing required showtime details" })
        }

        const theatre = await Theatre.findById(theatreId)
        if (!theatre) {
            return res.status(404).json({ success: false, message: "Selected theatre not found" })
        }

        const chosenScreen = theatre.screens.find(s => s.screenNumber === Number(screenNumber)) || theatre.screens[0]
        const totalSeats = chosenScreen?.totalSeats || 60

        const showtime = await Showtime.create({
            movie: movieId,
            theatre: theatreId,
            screenNumber: chosenScreen?.screenNumber || 1,
            startTime: new Date(startTime),
            ticketPrice: Number(ticketPrice),
            seats: generateSeats(totalSeats)
        })

        res.status(201).json({ success: true, message: "Showtime created successfully", showtime })
    } catch (err) {
        next(err)
    }
})

module.exports = router