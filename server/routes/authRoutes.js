const express = require("express")
const router = express.Router()
const {
    registerUser,
    verifyAccount,
    updateOrSetup2FATarget,
    confirm2FATargetUpdate,
    disable2FA,
    loginUser,
    verify2FALogin,
    getCurrentUser,
    logoutUser
} = require("../controller/authController")
const { verifyToken } = require("../middleware/verifyToken")

router.post("/register", registerUser)
router.post("/verify-account", verifyAccount)
router.post("/login", loginUser)
router.post("/verify-2fa-login", verifyToken, verify2FALogin)

router.post("/2fa/update-target-request", verifyToken, updateOrSetup2FATarget)
router.post("/2fa/update-target-confirm", verifyToken, confirm2FATargetUpdate)
router.post("/2fa/disable", verifyToken, disable2FA)

router.get("/me", verifyToken, getCurrentUser)
router.post("/logout", logoutUser)

module.exports = router