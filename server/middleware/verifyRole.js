const Theatre = require("../models/Theatre")
const Showtime = require("../models/Showtime")

const requireRole = (...allowedRoles) => {
    const roles = allowedRoles.flat()

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            })
        }

        if (req.user.role === "admin" || roles.includes(req.user.role)) {
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

        if (req.user.role !== "theatre-admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied: theatre admin or admin privilege required"
            })
        }

        const theatreId = req.body.theatreId || req.params.theatreId || req.query.theatreId

        if (theatreId) {
            const theatre = await Theatre.findById(theatreId)
            if (!theatre) {
                return res.status(404).json({
                    success: false,
                    message: "Theatre not found"
                })
            }

            if (theatre.owner.toString() !== req.user._id.toString()) {
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

            if (!showtime.theatre || showtime.theatre.owner.toString() !== req.user._id.toString()) {
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
    requireRole,
    requireTheatreAccess
}