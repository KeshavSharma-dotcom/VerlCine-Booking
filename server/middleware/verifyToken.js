const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
    const token = req.cookies?.token
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Token Required"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (decoded.is2FAEnabled && !decoded.is2FAVerified) {
            return res.status(403).json({
                success: false,
                message: "2FA verification required"
            })
        }
        req.user = decoded
        next()
    } catch (err) {
        return res.status(403).json({ success: false, message: "Invalid token" })
    }
}

module.exports = verifyToken