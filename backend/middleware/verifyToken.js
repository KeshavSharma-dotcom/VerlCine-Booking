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
        req.user = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch (err) {
        return res.status(403).json({ message: "Invalid token" })
    }
}

module.exports = verifyToken