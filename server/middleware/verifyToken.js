const { verifyAuthToken } = require("../utils/authServices")

const verifyToken = (req, res, next) => {
    let token = req.cookies?.token

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication token required"
        })
    }

    try {
        const decoded = verifyAuthToken(token)

        if (decoded.is2FAEnabled && !decoded.is2FAVerified) {
            return res.status(403).json({
                success: false,
                is2FARequired: true,
                message: "2FA verification required"
            })
        }

        req.user = decoded
        next()
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please log in again."
            })
        }

        return res.status(403).json({
            success: false,
            message: "Invalid or malformed authentication token"
        })
    }
}

const verify2FASessionToken = (req, res, next) => {
    let token = req.cookies?.token

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Session token required"
        })
    }

    try {
        const decoded = verifyAuthToken(token)
        req.user = decoded
        next()
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "2FA session expired. Please log in again."
            })
        }

        return res.status(403).json({
            success: false,
            message: "Invalid 2FA session token"
        })
    }
}

module.exports = {
    verifyToken,
    verify2FASessionToken
}