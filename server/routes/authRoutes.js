const express = require("express")
const router = express.Router()
const {
    registerUser,
    verifyAccount,
    resendVerificationOTP,
    loginUser,
    verify2FALogin,
    request2FAActivation,
    confirm2FAActivation,
    disable2FA,
    getCurrentUser,
    logoutUser
} = require("../controller/authController")
const { verifyToken, verify2FASessionToken } = require("../middleware/verifyToken")

router.post("/register", registerUser)
router.post("/verify-account", verifyAccount)
router.post("/resend-otp", resendVerificationOTP)
router.post("/login", loginUser)
router.post("/verify-2fa-login", verify2FASessionToken, verify2FALogin)

router.post("/2fa/enable-request", verifyToken, request2FAActivation)
router.post("/2fa/enable-confirm", verifyToken, confirm2FAActivation)
router.post("/2fa/disable", verifyToken, disable2FA)

router.get("/me", verifyToken, getCurrentUser)
router.post("/logout", logoutUser)

module.exports = router