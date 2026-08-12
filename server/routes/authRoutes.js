const express = require("express")
const router = express.Router()

const {
    registerUser,
    loginUser,
    verify2FA,
    toggle2FA,
    getCurrentUser,
    logoutUser
} = require("../controller/authController")

const verifyToken = require("../middleware/verifyToken")

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/verify-2fa", verifyToken, verify2FA)
router.post("/toggle-2fa", verifyToken, toggle2FA)
router.get("/me", verifyToken, getCurrentUser)
router.post("/logout", logoutUser)

module.exports = router