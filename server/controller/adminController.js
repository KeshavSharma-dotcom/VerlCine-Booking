const Booking = require("../models/Booking")
const Theatre = require("../models/Theatre")
const Movie = require("../models/Movie")
const User = require("../models/User")
const getDashboardMetrics = async (req, res, next) => {
    try {
        const [bookingStats, activeCinemas, activeMovies] = await Promise.all([
            Booking.aggregate([
                {
                    $match: {
                        status: { $in: "confirmed" }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalGMV: { $sum: "$totalAmount" },
                        totalTicketsSold: {
                            $sum: {
                                $cond: {
                                    if: { $isArray: "$seatsBooked" },
                                    then: { $size: "$seatsBooked" },
                                    else: 0
                                }
                            }
                        }
                    }
                }
            ]),
            Theatre.countDocuments({ isActive: true }),
            Movie.countDocuments({ isActive: true })
        ])

        const gmv = bookingStats[0]?.totalGMV || 0
        const totalTicketsSold = bookingStats[0]?.totalTicketsSold || 0

        res.status(200).json({
            success: true,
            metrics: {
                gmv,
                totalTicketsSold,
                activeCinemas,
                activeMovies
            }
        })
    } catch (err) {
        next(err)
    }
}

const getRevenueAnalytics = async (req, res, next) => {
    try {
        const { timeframe = "daily", days = 30 } = req.query

        const dateLimit = new Date()
        dateLimit.setDate(dateLimit.getDate() - (parseInt(days, 10) || 30))

        const dateFormat = timeframe === "monthly" ? "%Y-%m" : "%Y-%m-%d"

        const analytics = await Booking.aggregate([
            {
                $match: {
                    status: { $in: "confirmed" },
                    createdAt: { $gte: dateLimit }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: dateFormat,
                            date: "$createdAt"
                        }
                    },
                    totalTransactions: { $sum: 1 },
                    totalGrossVolume: { $sum: "$totalAmount" },
                    platformFeeRevenue: {
                        $sum: { $multiply: ["$totalAmount", 0.16] }
                    },
                    theatreDisbursement: {
                        $sum: { $multiply: ["$totalAmount", 0.84] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ])

        const formattedSeries = analytics.map((point) => ({
            date: point._id,
            totalTransactions: point.totalTransactions,
            totalGrossVolume: Math.round(point.totalGrossVolume * 100) / 100,
            platformFeeRevenue: Math.round(point.platformFeeRevenue * 100) / 100,
            theatreDisbursement: Math.round(point.theatreDisbursement * 100) / 100
        }))

        res.status(200).json({
            success: true,
            timeframe,
            count: formattedSeries.length,
            analytics: formattedSeries
        })
    } catch (err) {
        next(err)
    }
}

const getTopPerforming = async (req, res, next) => {
    try {
        const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 5))

        const [topMovies, topTheatres, topCities] = await Promise.all([
            // 1. Top Grossing Movies
            Booking.aggregate([
                { $match: { status: { $in: ["confirmed", "paid", "completed"] } } },
                {
                    $lookup: {
                        from: "showtimes",
                        localField: "showtime",
                        foreignField: "_id",
                        as: "showtimeDoc"
                    }
                },
                { $unwind: "$showtimeDoc" },
                {
                    $group: {
                        _id: "$showtimeDoc.movie",
                        revenue: { $sum: "$totalAmount" },
                        bookingsCount: { $sum: 1 },
                        ticketsSold: {
                            $sum: {
                                $cond: {
                                    if: { $isArray: "$seatsBooked" },
                                    then: { $size: "$seatsBooked" },
                                    else: 0
                                }
                            }
                        }
                    }
                },
                { $sort: { revenue: -1 } },
                { $limit: limit },
                {
                    $lookup: {
                        from: "movies",
                        localField: "_id",
                        foreignField: "_id",
                        as: "movieDoc"
                    }
                },
                { $unwind: "$movieDoc" },
                {
                    $project: {
                        _id: 1,
                        title: "$movieDoc.title",
                        posterUrl: "$movieDoc.posterUrl",
                        genre: "$movieDoc.genre",
                        revenue: { $round: ["$revenue", 2] },
                        bookingsCount: 1,
                        ticketsSold: 1
                    }
                }
            ]),

            // 2. Top Grossing Theaters
            Booking.aggregate([
                { $match: { status: { $in: ["confirmed", "paid", "completed"] } } },
                {
                    $lookup: {
                        from: "showtimes",
                        localField: "showtime",
                        foreignField: "_id",
                        as: "showtimeDoc"
                    }
                },
                { $unwind: "$showtimeDoc" },
                {
                    $group: {
                        _id: "$showtimeDoc.theatre",
                        revenue: { $sum: "$totalAmount" },
                        bookingsCount: { $sum: 1 },
                        ticketsSold: {
                            $sum: {
                                $cond: {
                                    if: { $isArray: "$seatsBooked" },
                                    then: { $size: "$seatsBooked" },
                                    else: 0
                                }
                            }
                        }
                    }
                },
                { $sort: { revenue: -1 } },
                { $limit: limit },
                {
                    $lookup: {
                        from: "theatres",
                        localField: "_id",
                        foreignField: "_id",
                        as: "theatreDoc"
                    }
                },
                { $unwind: "$theatreDoc" },
                {
                    $project: {
                        _id: 1,
                        name: "$theatreDoc.name",
                        city: "$theatreDoc.city",
                        address: "$theatreDoc.address",
                        revenue: { $round: ["$revenue", 2] },
                        bookingsCount: 1,
                        ticketsSold: 1
                    }
                }
            ]),

            // 3. Top Grossing Operational Cities
            Booking.aggregate([
                { $match: { status: { $in: ["confirmed", "paid", "completed"] } } },
                {
                    $lookup: {
                        from: "showtimes",
                        localField: "showtime",
                        foreignField: "_id",
                        as: "showtimeDoc"
                    }
                },
                { $unwind: "$showtimeDoc" },
                {
                    $lookup: {
                        from: "theatres",
                        localField: "showtimeDoc.theatre",
                        foreignField: "_id",
                        as: "theatreDoc"
                    }
                },
                { $unwind: "$theatreDoc" },
                {
                    $group: {
                        _id: "$theatreDoc.city",
                        revenue: { $sum: "$totalAmount" },
                        bookingsCount: { $sum: 1 },
                        ticketsSold: {
                            $sum: {
                                $cond: {
                                    if: { $isArray: "$seatsBooked" },
                                    then: { $size: "$seatsBooked" },
                                    else: 0
                                }
                            }
                        }
                    }
                },
                { $sort: { revenue: -1 } },
                { $limit: limit },
                {
                    $project: {
                        _id: 0,
                        city: "$_id",
                        revenue: { $round: ["$revenue", 2] },
                        bookingsCount: 1,
                        ticketsSold: 1
                    }
                }
            ])
        ])

        res.status(200).json({
            success: true,
            limit,
            topMovies,
            topTheatres,
            topCities
        })
    } catch (err) {
        next(err)
    }
}

const getUsers = async (req, res, next) => {
    try {
        const { role, search, page = 1, limit = 10 } = req.query

        const query = {}

        if (role) {
            const normalizedRole = String(role).trim().toLowerCase()
            if (normalizedRole === "theatreadmin" || normalizedRole === "theatre_admin") {
                query.role = { $in: ["theatre-admin", "theatre_admin"] }
            } else {
                query.role = normalizedRole
            }
        }

        if (search && String(search).trim().length > 0) {
            const searchRegex = new RegExp(String(search).trim(), "i")
            query.$or = [
                { name: searchRegex },
                { email: searchRegex }
            ]
        }

        const parsedPage = Math.max(1, parseInt(page, 10) || 1)
        const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10))
        const skip = (parsedPage - 1) * parsedLimit

        const [users, total] = await Promise.all([
            User.find(query)
                .select("-password")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parsedLimit)
                .lean(),
            User.countDocuments(query)
        ])

        res.status(200).json({
            success: true,
            total,
            page: parsedPage,
            limit: parsedLimit,
            totalPages: Math.ceil(total / parsedLimit),
            users
        })
    } catch (err) {
        next(err)
    }
}
const updateUserRole = async (req, res, next) => {
    try {
        const { userId } = req.params
        const { role } = req.body

        if (!role) {
            return res.status(400).json({
                success: false,
                message: "Role is required"
            })
        }

        const normalizedRole = String(role).trim().toLowerCase()
        const validRoles = ["user", "theatre_admin", "theatre-admin", "admin"]

        if (!validRoles.includes(normalizedRole)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role specified. Must be user, theatre_admin, or admin"
            })
        }

        if (req.user._id.toString() === userId && normalizedRole !== "admin") {
            return res.status(400).json({
                success: false,
                message: "Admins cannot demote their own account"
            })
        }

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        user.role = normalizedRole

        if (normalizedRole === "theatre_admin" || normalizedRole === "theatre-admin") {
            user.theatreAdminStatus = "approved"
        }

        await user.save()

        res.status(200).json({
            success: true,
            message: `User role successfully updated to ${normalizedRole}`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                theatreAdminStatus: user.theatreAdminStatus
            }
        })
    } catch (err) {
        next(err)
    }
}
const updateUserStatus = async (req, res, next) => {
    try {
        const { userId } = req.params
        const { isBlocked, isActive } = req.body

        if (isBlocked === undefined && isActive === undefined) {
            return res.status(400).json({
                success: false,
                message: "Please provide either isBlocked or isActive status"
            })
        }

        if (req.user._id.toString() === userId) {
            return res.status(400).json({
                success: false,
                message: "Admins cannot suspend or deactivate their own account"
            })
        }

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const targetBlocked = isBlocked !== undefined ? Boolean(isBlocked) : !Boolean(isActive)

        user.isBlocked = targetBlocked
        user.isActive = !targetBlocked

        await user.save()

        res.status(200).json({
            success: true,
            message: `User account successfully ${targetBlocked ? "suspended" : "activated"}`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isBlocked: user.isBlocked,
                isActive: user.isActive
            }
        })
    } catch (err) {
        next(err)
    }
}
module.exports = {
    getDashboardMetrics,
    getRevenueAnalytics,
    getTopPerforming,
    getUsers,
    updateUserRole,
    updateUserStatus,
    
}