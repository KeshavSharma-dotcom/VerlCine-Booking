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

const send2FAOTPNotification = async (target, method, otp, purposeText = "2FA verification") => {
    const message = `Your ${purposeText} code is: ${otp}. It will expire in 10 minutes.`
    if (method === "email") {
        await sendEmail({
            email: target,
            subject: `Your ${purposeText} Code`,
            message
        })
    }
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

const setAuthCookie = (res, token, is2FAVerified = true) => {
    const maxAge = is2FAVerified ? 7 * 24 * 60 * 60 * 1000 : 10 * 60 * 1000
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge
    })
}

module.exports = {
    generateOTP,
    hashOTP,
    sendAccountVerificationOTP,
    send2FAOTPNotification,
    generateAuthToken,
    setAuthCookie
}