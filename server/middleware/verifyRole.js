const jwt = require("jsonwebtoken")
const User = require("../models/User")
const Theatre = require("../models/Theatre")
const Showtime = require("../models/Showtime")

const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1]

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id || decoded._id).select("-password")

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Account no longer exists"
            })
        }

        req.user = user
        next()
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired session token"
        })
    }
}

const requireRole = (...allowedRoles) => {
    const roles = allowedRoles.flat()

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            })
        }

        const userRole = req.user.role
        const normalizedRole = userRole === "theatre_admin" ? "theatre-admin" : userRole

        const isAuthorized = userRole === "admin" ||
            roles.includes(userRole) ||
            roles.includes(normalizedRole) ||
            (normalizedRole === "theatre-admin" && roles.includes("theatre_admin"))

        if (isAuthorized) {
            return next()
        }

        return res.status(403).json({
            success: false,
            message: "Access denied: insufficient permissions"
        })
    }
}

const requireTheatreAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            })
        }

        if (req.user.role === "admin") {
            return next()
        }

        if (req.user.role !== "theatre-admin" && req.user.role !== "theatre_admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied: theatre admin or admin privilege required"
            })
        }

        const theatreId = req.body.theatreId || req.params.theatreId || req.query.theatreId || req.params.id

        if (theatreId) {
            const theatre = await Theatre.findById(theatreId)
            if (!theatre) {
                return res.status(404).json({
                    success: false,
                    message: "Theatre not found"
                })
            }

            if (!theatre.owner || theatre.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied: you do not manage this theatre"
                })
            }

            req.theatre = theatre
            return next()
        }

        const showtimeId = req.params.showtimeId || req.body.showtimeId

        if (showtimeId) {
            const showtime = await Showtime.findById(showtimeId).populate("theatre")
            if (!showtime) {
                return res.status(404).json({
                    success: false,
                    message: "Showtime not found"
                })
            }

            if (!showtime.theatre || !showtime.theatre.owner || showtime.theatre.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied: you do not manage this showtime's theatre"
                })
            }

            req.showtime = showtime
            return next()
        }

        return res.status(400).json({
            success: false,
            message: "Target theatreId or showtimeId is required for authorization"
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    protect,
    requireRole,
    requireTheatreAccess
}