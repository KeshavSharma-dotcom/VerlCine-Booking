const crypto = require("crypto")
const User = require("../models/User")
const {
    generateOTP,
    hashOTP,
    sendAccountVerificationOTP,
    send2FAOTPNotification,
    generateAuthToken,
    setAuthCookie,
    clearAuthCookie
} = require("../utils/authServices")

const safeCompareHashes = (storedHash, providedHash) => {
    if (!storedHash || !providedHash) return false
    const bufA = Buffer.from(storedHash, "hex")
    const bufB = Buffer.from(providedHash, "hex")
    if (bufA.length !== bufB.length) return false
    return crypto.timingSafeEqual(bufA, bufB)
}

const registerUser = async (req, res, next) => {
    let createdUser = null
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const normalizedEmail = email.toLowerCase().trim()
        const existingUser = await User.findOne({ email: normalizedEmail })

        if (existingUser) {
            if (!existingUser.isVerified) {
                const otp = generateOTP()
                existingUser.name = name.trim()
                existingUser.password = password
                existingUser.otpCode = hashOTP(otp)
                existingUser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
                existingUser.otpPurpose = "verification"
                await existingUser.save()
                await sendAccountVerificationOTP(existingUser, otp)

                return res.status(200).json({
                    success: true,
                    message: "Account pending verification. A new OTP has been sent to your email.",
                    userId: existingUser._id
                })
            }
            return res.status(400).json({ success: false, message: "User already exists" })
        }

        const otp = generateOTP()
        createdUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
            isVerified: false,
            isTwoFactorEnabled: false,
            otpCode: hashOTP(otp),
            otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
            otpPurpose: "verification"
        })

        await sendAccountVerificationOTP(createdUser, otp)

        res.status(201).json({
            success: true,
            message: "Registration successful. Please verify the OTP sent to your email to activate your account.",
            userId: createdUser._id
        })
    } catch (err) {
        if (createdUser && createdUser._id && !createdUser.isVerified) {
            await User.findByIdAndDelete(createdUser._id).catch(() => null)
        }
        next(err)
    }
}

const verifyAccount = async (req, res, next) => {
    try {
        const { userId, otp } = req.body

        if (!userId || !otp) {
            return res.status(400).json({ success: false, message: "User ID and OTP are required" })
        }

        const user = await User.findById(userId).select("+otpCode +otpExpiresAt +otpPurpose")
        if (!user || user.otpPurpose !== "verification" || !user.otpCode || !user.otpExpiresAt) {
            return res.status(400).json({ success: false, message: "Invalid verification request" })
        }

        if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." })
        }

        const calculatedHash = hashOTP(otp.trim())
        if (!safeCompareHashes(user.otpCode, calculatedHash)) {
            return res.status(400).json({ success: false, message: "Incorrect OTP" })
        }

        user.isVerified = true
        user.otpCode = null
        user.otpExpiresAt = null
        user.otpPurpose = null
        await user.save()

        const token = generateAuthToken(user, true)
        setAuthCookie(res, token, true)

        res.status(200).json({
            success: true,
            message: "Account verified successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                isTwoFactorEnabled: user.isTwoFactorEnabled
            }
        })
    } catch (err) {
        next(err)
    }
}

const resendVerificationOTP = async (req, res, next) => {
    try {
        const { userId, email } = req.body
        const query = userId ? { _id: userId } : { email: email ? email.toLowerCase().trim() : null }

        if (!query._id && !query.email) {
            return res.status(400).json({ success: false, message: "User ID or email is required" })
        }

        const user = await User.findOne(query)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: "Account is already verified" })
        }

        const otp = generateOTP()
        user.otpCode = hashOTP(otp)
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
        user.otpPurpose = "verification"
        await user.save()

        await sendAccountVerificationOTP(user, otp)

        res.status(200).json({
            success: true,
            message: "A new verification OTP has been dispatched to your email",
            userId: user._id
        })
    } catch (err) {
        next(err)
    }
}

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" })
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password")
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid email or password" })
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your account before logging in",
                userId: user._id,
                isUnverified: true
            })
        }

        if (user.isTwoFactorEnabled) {
            const otp = generateOTP()
            user.otpCode = hashOTP(otp)
            user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
            user.otpPurpose = "login_2fa"
            await user.save()

            await send2FAOTPNotification(user, otp)

            const tempToken = generateAuthToken(user, false)
            setAuthCookie(res, tempToken, false)

            return res.status(200).json({
                success: true,
                is2FARequired: true,
                message: "2FA OTP sent to your registered email"
            })
        }

        const token = generateAuthToken(user, true)
        setAuthCookie(res, token, true)

        res.status(200).json({
            success: true,
            is2FARequired: false,
            message: "Logged in successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                isTwoFactorEnabled: user.isTwoFactorEnabled
            }
        })
    } catch (err) {
        next(err)
    }
}

const verify2FALogin = async (req, res, next) => {
    try {
        const { otp } = req.body
        const userId = req.user.id

        if (!otp) {
            return res.status(400).json({ success: false, message: "OTP is required" })
        }

        const user = await User.findById(userId).select("+otpCode +otpExpiresAt +otpPurpose")
        if (!user || user.otpPurpose !== "login_2fa" || !user.otpCode || !user.otpExpiresAt) {
            return res.status(400).json({ success: false, message: "Invalid 2FA session" })
        }

        if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "OTP has expired. Please log in again." })
        }

        const calculatedHash = hashOTP(otp.trim())
        if (!safeCompareHashes(user.otpCode, calculatedHash)) {
            return res.status(400).json({ success: false, message: "Incorrect OTP" })
        }

        user.otpCode = null
        user.otpExpiresAt = null
        user.otpPurpose = null
        await user.save()

        const token = generateAuthToken(user, true)
        setAuthCookie(res, token, true)

        res.status(200).json({
            success: true,
            message: "2FA verification successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                isTwoFactorEnabled: user.isTwoFactorEnabled
            }
        })
    } catch (err) {
        next(err)
    }
}

const request2FAActivation = async (req, res, next) => {
    try {
        const { password } = req.body
        const userId = req.user.id

        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required to setup 2FA" })
        }

        const user = await User.findById(userId).select("+password")
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid password" })
        }

        if (user.isTwoFactorEnabled) {
            return res.status(400).json({ success: false, message: "2FA is already active on this account" })
        }

        const otp = generateOTP()
        user.otpCode = hashOTP(otp)
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
        user.otpPurpose = "login_2fa"
        await user.save()

        await send2FAOTPNotification(user, otp)

        res.status(200).json({
            success: true,
            message: "Verification code sent to your email to confirm 2FA enablement"
        })
    } catch (err) {
        next(err)
    }
}

const confirm2FAActivation = async (req, res, next) => {
    try {
        const { otp } = req.body
        const userId = req.user.id

        if (!otp) {
            return res.status(400).json({ success: false, message: "OTP is required" })
        }

        const user = await User.findById(userId).select("+otpCode +otpExpiresAt +otpPurpose")
        if (!user || user.otpPurpose !== "login_2fa" || !user.otpCode || !user.otpExpiresAt) {
            return res.status(400).json({ success: false, message: "Invalid request" })
        }

        if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "OTP has expired" })
        }

        const calculatedHash = hashOTP(otp.trim())
        if (!safeCompareHashes(user.otpCode, calculatedHash)) {
            return res.status(400).json({ success: false, message: "Incorrect OTP" })
        }

        user.isTwoFactorEnabled = true
        user.otpCode = null
        user.otpExpiresAt = null
        user.otpPurpose = null
        await user.save()

        res.status(200).json({
            success: true,
            message: "Two-factor authentication enabled successfully",
            isTwoFactorEnabled: true
        })
    } catch (err) {
        next(err)
    }
}

const disable2FA = async (req, res, next) => {
    try {
        const { password } = req.body
        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required to disable 2FA" })
        }

        const user = await User.findById(req.user.id).select("+password")
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid password" })
        }

        user.isTwoFactorEnabled = false
        user.otpCode = null
        user.otpExpiresAt = null
        user.otpPurpose = null
        await user.save()

        res.status(200).json({
            success: true,
            message: "2FA disabled successfully",
            isTwoFactorEnabled: false
        })
    } catch (err) {
        next(err)
    }
}

const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .select("name email role profilePicURL isVerified isTwoFactorEnabled theatreAdminStatus createdAt")
            .lean()

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        res.status(200).json({
            success: true,
            user
        })
    } catch (err) {
        next(err)
    }
}

const logoutUser = (req, res) => {
    clearAuthCookie(res)
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    })
}

module.exports = {
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
}