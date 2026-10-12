const express = require("express")
const router = express.Router()

const {
    createBookingOrder,
    verifyBookingPayment,
    getUserBookings,
    getBookingById,
    cancelBooking
} = require("../controller/bookingController")

const { verifyToken } = require("../middleware/verifyToken")

router.post("/", verifyToken, createBookingOrder)
router.post("/order", verifyToken, createBookingOrder)
router.post("/verify", verifyToken, verifyBookingPayment)
router.get("/my-bookings", verifyToken, getUserBookings)
router.get("/:id", verifyToken, getBookingById)
router.patch("/:id/cancel", verifyToken, cancelBooking)

module.exports = router