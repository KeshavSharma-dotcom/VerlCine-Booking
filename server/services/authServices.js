const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const config = require("../config/config")
const sendEmail = require("../utils/emailService")

const generateOTP = () => {
    return crypto.randomInt(100000,1000000)
}

const send2FAOTP = async (user, otp) => {
    const message = `Your 2FA verification code is: ${otp}. It will expire in 10 minutes.`
    await sendEmail({
        email: user.email,
        subject: "Your 2FA Verification Code",
        message
    })
}

const generateAuthToken = (user, is2FAVerified = true) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            is2FAEnabled: user.isTwoFactorEnabled,
            is2FAVerified
        },
        config.jwtSecret,
        { expiresIn: "7d" }
    )
}

const setAuthCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
}

module.exports = {
    generateOTP,
    send2FAOTP,
    generateAuthToken,
    setAuthCookie
}