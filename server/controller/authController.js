const User = require("../models/User")
const {
    generateOTP,
    hashOTP,
    sendAccountVerificationOTP,
    send2FAOTPNotification,
    generateAuthToken,
    setAuthCookie
} = require("../utils/authServices")

const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const normalizedEmail = email.toLowerCase().trim()
        const existingUser = await User.findOne({ email: normalizedEmail })
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" })
        }

        const otp = generateOTP()
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
            isVerified: false,
            isTwoFactorEnabled: false,
            otpCode: hashOTP(otp),
            otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
            otpPurpose: "account-verification"
        })

        await sendAccountVerificationOTP(user, otp)

        res.status(201).json({
            success: true,
            message: "Registration successful. Verification OTP sent to your primary email.",
            userId: user._id
        })
    } catch (err) {
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
        if (!user || user.otpPurpose !== "account-verification" || !user.otpCode || user.otpExpiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification OTP" })
        }

        if (user.otpCode !== hashOTP(otp.trim())) {
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

const updateOrSetup2FATarget = async (req, res, next) => {
    try {
        const { method, newTarget, password } = req.body
        const userId = req.user.id

        if (!method || !newTarget || !password) {
            return res.status(400).json({ success: false, message: "Method, target (email/phone), and current password are required" })
        }

        if (!["email", "phone"].includes(method)) {
            return res.status(400).json({ success: false, message: "Invalid 2FA method" })
        }

        const user = await User.findById(userId).select("+password")
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid password" })
        }

        const formattedTarget = newTarget.trim().toLowerCase()
        const otp = generateOTP()

        user.tempTwoFactorTarget = formattedTarget
        user.tempTwoFactorMethod = method
        user.otpCode = hashOTP(otp)
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
        user.otpPurpose = "2fa-setup-or-update"
        await user.save()

        await send2FAOTPNotification(formattedTarget, method, otp, "2FA Setup/Update")

        res.status(200).json({
            success: true,
            message: `OTP sent to ${formattedTarget}. Verify the code to apply this 2FA target.`
        })
    } catch (err) {
        next(err)
    }
}

const confirm2FATargetUpdate = async (req, res, next) => {
    try {
        const { otp } = req.body
        const userId = req.user.id

        if (!otp) {
            return res.status(400).json({ success: false, message: "OTP is required" })
        }

        const user = await User.findById(userId).select("+otpCode +otpExpiresAt +otpPurpose +tempTwoFactorTarget +tempTwoFactorMethod")
        if (!user || user.otpPurpose !== "2fa-setup-or-update" || !user.otpCode || user.otpExpiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" })
        }

        if (user.otpCode !== hashOTP(otp.trim())) {
            return res.status(400).json({ success: false, message: "Incorrect OTP. 2FA target was not updated." })
        }

        user.isTwoFactorEnabled = true
        user.twoFactorMethod = user.tempTwoFactorMethod
        user.twoFactorTarget = user.tempTwoFactorTarget
        user.tempTwoFactorMethod = null
        user.tempTwoFactorTarget = null
        user.otpCode = null
        user.otpExpiresAt = null
        user.otpPurpose = null
        await user.save()

        res.status(200).json({
            success: true,
            message: "2FA verified and activated on new destination",
            isTwoFactorEnabled: user.isTwoFactorEnabled,
            twoFactorMethod: user.twoFactorMethod,
            twoFactorTarget: user.twoFactorTarget
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
        user.twoFactorMethod = null
        user.twoFactorTarget = null
        user.tempTwoFactorMethod = null
        user.tempTwoFactorTarget = null
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
            return res.status(403).json({ success: false, message: "Please verify your account before logging in", userId: user._id })
        }

        if (user.isTwoFactorEnabled) {
            const otp = generateOTP()
            user.otpCode = hashOTP(otp)
            user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
            user.otpPurpose = "2fa-login"
            await user.save()

            const targetDestination = user.twoFactorTarget || user.email
            const targetMethod = user.twoFactorMethod || "email"

            await send2FAOTPNotification(targetDestination, targetMethod, otp, "Login 2FA")

            const tempToken = generateAuthToken(user, false)
            setAuthCookie(res, tempToken, false)

            return res.status(200).json({
                success: true,
                is2FARequired: true,
                message: `2FA OTP sent to ${targetDestination}`
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
        if (!user || user.otpPurpose !== "2fa-login" || !user.otpCode || user.otpExpiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" })
        }

        if (user.otpCode !== hashOTP(otp.trim())) {
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

const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .select("name email role profilePicURL isVerified isTwoFactorEnabled twoFactorMethod twoFactorTarget theatreAdminStatus createdAt")
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
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    })
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    })
}

module.exports = {
    registerUser,
    verifyAccount,
    updateOrSetup2FATarget,
    confirm2FATargetUpdate,
    disable2FA,
    loginUser,
    verify2FALogin,
    getCurrentUser,
    logoutUser
}