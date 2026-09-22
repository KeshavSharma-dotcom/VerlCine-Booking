const express = require("express")
const router = express.Router()
const Showtime = require("../models/Showtime")
const { getShowtimes } = require("../controller/showTimeController")

router.get("/", getShowtimes)

router.get("/:id", async (req, res, next) => {
    try {
        const showtime = await Showtime.findById(req.params.id)
            .populate("movie", "title posterUrl durationMinutes rating genre description")
            .populate("theatre", "name address city location screens")
            .lean()

        if (!showtime) {
            return res.status(404).json({ success: false, message: "Showtime session not found" })
        }

        res.status(200).json({ success: true, showtime })
    } catch (err) {
        next(err)
    }
})

module.exports = router