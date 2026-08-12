const User = require("../models/User")
const {
    generateOTP,
    send2FAOTP,
    generateAuthToken,
    setAuthCookie
} = require("../utils/authService")

const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" })
        }

        const user = await User.create({ name, email, password })
        const token = generateAuthToken(user, true)
        setAuthCookie(res, token)

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isTwoFactorEnabled: user.isTwoFactorEnabled
            }
        })
    } catch (err) {
        next(err)
    }
}

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email }).select("+password")
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid email or password" })
        }

        if (user.isTwoFactorEnabled) {
            const otp = generateOTP()
            user.otpCode = otp
            user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
            await user.save()

            await send2FAOTP(user, otp)

            const tempToken = generateAuthToken(user, false)
            setAuthCookie(res, tempToken)

            return res.status(200).json({
                success: true,
                is2FARequired: true,
                message: "2FA OTP sent to your email"
            })
        }

        const token = generateAuthToken(user, true)
        setAuthCookie(res, token)

        res.status(200).json({
            success: true,
            is2FARequired: false,
            message: "Logged in successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isTwoFactorEnabled: user.isTwoFactorEnabled
            }
        })
    } catch (err) {
        next(err)
    }
}

const verify2FA = async (req, res, next) => {
    try {
        const { otp } = req.body
        const userId = req.user.id

        const user = await User.findById(userId).select("+otpCode")
        if (!user || !user.otpCode || user.otpExpiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" })
        }

        if (user.otpCode !== otp) {
            return res.status(400).json({ success: false, message: "Incorrect OTP" })
        }

        user.otpCode = null
        user.otpExpiresAt = null
        await user.save()

        const token = generateAuthToken(user, true)
        setAuthCookie(res, token)

        res.status(200).json({
            success: true,
            message: "2FA verification successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isTwoFactorEnabled: user.isTwoFactorEnabled
            }
        })
    } catch (err) {
        next(err)
    }
}

const toggle2FA = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
        user.isTwoFactorEnabled = !user.isTwoFactorEnabled
        await user.save()

        res.status(200).json({
            success: true,
            message: `2FA ${user.isTwoFactorEnabled ? "enabled" : "disabled"} successfully`,
            isTwoFactorEnabled: user.isTwoFactorEnabled
        })
    } catch (err) {
        next(err)
    }
}

const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
        res.status(200).json({
            success: true,
            user
        })
    } catch (err) {
        next(err)
    }
}

const logoutUser = (req, res) => {
    res.clearCookie("token")
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    })
}

module.exports = {
    registerUser,
    loginUser,
    verify2FA,
    toggle2FA,
    getCurrentUser,
    logoutUser
}