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

module.exports = { requireRole }