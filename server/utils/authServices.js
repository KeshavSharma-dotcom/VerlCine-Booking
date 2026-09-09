const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const config = require("../config/config")
const sendEmail = require("./emailService")

const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString()
}

const hashOTP = (otp) => {
    return crypto.createHash("sha256").update(String(otp)).digest("hex")
}

const sendAccountVerificationOTP = async (user, otp) => {
    const message = `Your account verification code is: ${otp}. It will expire in 10 minutes.`
    await sendEmail({
        email: user.email,
        subject: "Verify Your Account",
        message
    })
}

const send2FAOTPNotification = async (user, otp) => {
    const message = `Your two-factor authentication code is: ${otp}. It will expire in 10 minutes.`
    await sendEmail({
        email: user.email,
        subject: "Your 2FA Verification Code",
        message
    })
}

const sendPasswordResetOTP = async (user, otp) => {
    const message = `Your password reset code is: ${otp}. It will expire in 10 minutes.`
    await sendEmail({
        email: user.email,
        subject: "Reset Your Password",
        message
    })
}

const generateAuthToken = (user, is2FAVerified = true) => {
    const expiresIn = is2FAVerified ? "7d" : "10m"
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            is2FAEnabled: user.isTwoFactorEnabled,
            is2FAVerified
        },
        config.auth.jwtSecret,
        { expiresIn }
    )
}

const verifyAuthToken = (token) => {
    return jwt.verify(token, config.auth.jwtSecret)
}

const setAuthCookie = (res, token, is2FAVerified = true) => {
    const maxAge = is2FAVerified ? 7 * 24 * 60 * 60 * 1000 : 10 * 60 * 1000
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge
    })
}

const clearAuthCookie = (res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        expires: new Date(0)
    })
}

module.exports = {
    generateOTP,
    hashOTP,
    sendAccountVerificationOTP,
    send2FAOTPNotification,
    sendPasswordResetOTP,
    generateAuthToken,
    verifyAuthToken,
    setAuthCookie,
    clearAuthCookie
}