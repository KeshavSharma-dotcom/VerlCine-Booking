const express = require("express")
const router = express.Router()

const authRoutes = require("./authRoutes")
const movieRoutes = require("./movieRoutes")
const showTimeRoutes = require("./showTimeRoutes")
const theatreRoutes = require("./theatreRoutes")
const locationRoutes = require("./locationRoutes")
const bookingRoutes = require("./bookingRoutes")
router.use("/auth", authRoutes)
router.use("/v1/auth", authRoutes)

router.use("/movies", movieRoutes)
router.use("/v1/movies", movieRoutes)

router.use("/showtimes", showTimeRoutes)
router.use("/v1/showtimes", showTimeRoutes)

router.use("/theatres", theatreRoutes)
router.use("/v1/theatres", theatreRoutes)

router.use("/locations", locationRoutes)
router.use("/v1/locations", locationRoutes)

router.use("/bookings", bookingRoutes)
router.use("/v1/bookings", bookingRoutes)

module.exports = router