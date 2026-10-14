const Theatre = require("../models/Theatre")
const User = require("../models/User")
const geoConfig = require("../config/geoConfig")
const { buildNearSphereQuery, calculateDistanceKm } = require("../utils/geoUtils")
const { syncCinemasFromOsm } = require("../services/theatreSyncService")

const getAllTheatres = async (req, res, next) => {
    try {
        const { city, active, limit = 50, page = 1 } = req.query
        const query = {}

        if (active !== undefined) {
            query.isActive = active === "true"
        }

        if (city && String(city).trim().length > 0) {
            let cityPattern = String(city).trim()
            if (/^(delhi|new\s*delhi|delhi\s*ncr)$/i.test(cityPattern)) {
                cityPattern = "(New Delhi|Delhi NCR|Delhi)"
            }
            query.city = new RegExp(`^${cityPattern}$`, "i")
        }

        const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(100, Math.max(1, parseInt(limit, 10)))
        const take = Math.min(100, Math.max(1, parseInt(limit, 10)))

        const [theatres, total] = await Promise.all([
            Theatre.find(query)
                .populate("owner", "name email role")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(take)
                .lean(),
            Theatre.countDocuments(query)
        ])

        const formattedTheatres = theatres.map((t) => ({
            ...t,
            screenCount: Array.isArray(t.screens) ? t.screens.length : 0,
            managerInfo: t.owner ? {
                id: t.owner._id,
                name: t.owner.name,
                email: t.owner.email,
                role: t.owner.role
            } : null
        }))

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            count: formattedTheatres.length,
            theatres: formattedTheatres
        })
    } catch (err) {
        next(err)
    }
}

const getNearbyTheatres = async (req, res, next) => {
    try {
        const { lat, lng, radius, city } = req.query
        const params = geoConfig.getSanitizedParams(lat, lng, radius, city)

        const spatialQuery = buildNearSphereQuery(params.lat, params.lng, params.radiusKm)
        let filter = {
            isActive: true,
            location: spatialQuery
        }

        let theatres = await Theatre.find(filter)
            .populate("owner", "name email role")
            .lean()

        if (theatres.length === 0) {
            await syncCinemasFromOsm({
                lat: params.lat,
                lng: params.lng,
                radiusKm: params.radiusKm,
                defaultCity: params.city
            })

            theatres = await Theatre.find(filter)
                .populate("owner", "name email role")
                .lean()
        }

        const enrichedTheatres = theatres.map((t) => {
            const [tLng, tLat] = t.location?.coordinates || []
            const distance = calculateDistanceKm(params.lat, params.lng, tLat, tLng)
            return {
                ...t,
                distanceKm: distance !== null ? distance : null,
                screenCount: Array.isArray(t.screens) ? t.screens.length : 0
            }
        })

        res.status(200).json({
            success: true,
            origin: {
                lat: params.lat,
                lng: params.lng,
                radiusKm: params.radiusKm,
                city: params.city
            },
            count: enrichedTheatres.length,
            theatres: enrichedTheatres
        })
    } catch (err) {
        next(err)
    }
}

const getTheatreById = async (req, res, next) => {
    try {
        const theatre = await Theatre.findById(req.params.id)
            .populate("owner", "name email role")

        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: "Theatre not found"
            })
        }

        res.status(200).json({
            success: true,
            theatre
        })
    } catch (err) {
        next(err)
    }
}

const createTheatre = async (req, res, next) => {
    try {
        const { name, city, address, screens, coordinates, adminId, facilities, contactInfo } = req.body

        if (!name || !city || !address) {
            return res.status(400).json({
                success: false,
                message: "Name, city, and address are required"
            })
        }

        let assignedOwner = null
        if (adminId) {
            const candidate = await User.findById(adminId)
            if (!candidate) {
                return res.status(404).json({
                    success: false,
                    message: "Specified theatre admin user not found"
                })
            }
            assignedOwner = candidate._id
        } else if (req.user?.role === "theatre-admin") {
            assignedOwner = req.user._id
        }

        const formattedScreens = Array.isArray(screens) && screens.length > 0
            ? screens.map((s, idx) => ({
                screenNumber: Number(s.screenNumber) || (idx + 1),
                totalSeats: Number(s.totalSeats) || 60
            }))
            : [{ screenNumber: 1, totalSeats: 60 }]

        let finalCoordinates = [geoConfig.defaultCoordinates.lng, geoConfig.defaultCoordinates.lat]
        if (Array.isArray(coordinates) && coordinates.length === 2) {
            const [lng, lat] = coordinates.map(Number)
            if (Number.isFinite(lng) && Number.isFinite(lat)) {
                finalCoordinates = [lng, lat]
            }
        }

        const theatre = await Theatre.create({
            name: String(name).trim(),
            city: String(city).trim(),
            address: String(address).trim(),
            location: {
                type: "Point",
                coordinates: finalCoordinates
            },
            screens: formattedScreens,
            owner: assignedOwner,
            facilities: Array.isArray(facilities) ? facilities.map(f => String(f).trim()) : [],
            contactInfo: contactInfo || {},
            isActive: true
        })

        res.status(201).json({
            success: true,
            message: "Theatre registered successfully",
            theatre
        })
    } catch (err) {
        next(err)
    }
}

const updateTheatre = async (req, res, next) => {
    try {
        const { name, city, address, screens, isActive, coordinates, facilities, contactInfo } = req.body

        const theatre = await Theatre.findById(req.params.id)

        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: "Theatre not found"
            })
        }

        if (name) theatre.name = String(name).trim()
        if (city) theatre.city = String(city).trim()
        if (address) theatre.address = String(address).trim()
        if (typeof isActive === "boolean") theatre.isActive = isActive

        if (Array.isArray(coordinates) && coordinates.length === 2) {
            const [lng, lat] = coordinates.map(Number)
            if (Number.isFinite(lng) && Number.isFinite(lat)) {
                theatre.location = {
                    type: "Point",
                    coordinates: [lng, lat]
                }
            }
        }

        if (Array.isArray(screens) && screens.length > 0) {
            theatre.screens = screens.map((s, idx) => ({
                screenNumber: Number(s.screenNumber) || (idx + 1),
                totalSeats: Number(s.totalSeats) || 60
            }))
        }

        if (Array.isArray(facilities)) {
            theatre.facilities = facilities.map(f => String(f).trim())
        }

        if (contactInfo && typeof contactInfo === "object") {
            theatre.contactInfo = {
                ...theatre.contactInfo,
                ...contactInfo
            }
        }

        const updatedTheatre = await theatre.save()

        res.status(200).json({
            success: true,
            message: "Theatre updated successfully",
            theatre: updatedTheatre
        })
    } catch (err) {
        next(err)
    }
}

const assignTheatreAdmin = async (req, res, next) => {
    try {
        const { adminId } = req.body
        const theatreId = req.params.id

        if (!adminId) {
            return res.status(400).json({
                success: false,
                message: "adminId is required to assign a manager"
            })
        }

        const [theatre, user] = await Promise.all([
            Theatre.findById(theatreId),
            User.findById(adminId)
        ])

        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: "Theatre not found"
            })
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Target user not found"
            })
        }

        if (user.role !== "theatre-admin" && user.role !== "admin") {
            user.role = "theatre-admin"
            await user.save()
        }

        theatre.owner = user._id
        await theatre.save()

        res.status(200).json({
            success: true,
            message: "Theatre admin assigned successfully",
            theatreId: theatre._id,
            assignedAdmin: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (err) {
        next(err)
    }
}

const getTheatreAdminProfile = async (req, res, next) => {
    try {
        const theatre = await Theatre.findOne({ owner: req.user._id, isActive: true })
            .populate("owner", "name email role")

        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: "No active theatre found assigned to this admin"
            })
        }

        res.status(200).json({
            success: true,
            theatre
        })
    } catch (err) {
        next(err)
    }
}

const updateTheatreAdminProfile = async (req, res, next) => {
    try {
        const { facilities, contactInfo, name, address } = req.body

        const theatre = await Theatre.findOne({ owner: req.user._id, isActive: true })

        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: "No active theatre found assigned to this admin"
            })
        }

        if (Array.isArray(facilities)) {
            theatre.facilities = facilities.map((f) => String(f).trim())
        }

        if (contactInfo && typeof contactInfo === "object") {
            theatre.contactInfo = {
                ...theatre.contactInfo,
                ...contactInfo
            }
        }

        if (name) theatre.name = String(name).trim()
        if (address) theatre.address = String(address).trim()

        const savedTheatre = await theatre.save()

        res.status(200).json({
            success: true,
            message: "Theatre profile updated successfully",
            theatre: savedTheatre
        })
    } catch (err) {
        next(err)
    }
}

const deleteTheatre = async (req, res, next) => {
    try {
        const theatre = await Theatre.findById(req.params.id)

        if (!theatre) {
            return res.status(404).json({
                success: false,
                message: "Theatre not found"
            })
        }

        theatre.isActive = false
        await theatre.save()

        res.status(200).json({
            success: true,
            message: "Theatre deactivated successfully",
            id: req.params.id
        })
    } catch (err) {
        next(err)
    }
}

const getDistinctCities = async (req, res, next) => {
    try {
        const cityAggregation = await Theatre.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: "$city",
                    theatreCount: { $sum: 1 } } }, {$sort: { _id: 1 } }
        ])

        const cities = cityAggregation.map((c) => ({
            city: c._id,
            theatreCount: c.theatreCount
        }))

        res.status(200).json({
            success: true,
            cities
        })
    } catch (err) {
        next(err)
    }
}

const triggerOsmSync = async (req, res, next) => {
    try {
        const { lat, lng, radius, city } = req.body
        const params = geoConfig.getSanitizedParams(lat, lng, radius, city)

        const syncResult = await syncCinemasFromOsm({
            lat: params.lat,
            lng: params.lng,
            radiusKm: params.radiusKm,
            defaultCity: params.city,
            ownerId: req.user?._id || null
        })

        res.status(200).json({
            success: true,
            message: "OSM cinema sync completed successfully",
            params,
            metrics: syncResult
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getAllTheatres,
    getNearbyTheatres,
    getTheatreById,
    createTheatre,
    updateTheatre,
    assignTheatreAdmin,
    getTheatreAdminProfile,
    updateTheatreAdminProfile,
    deleteTheatre,
    getDistinctCities,
    triggerOsmSync
}