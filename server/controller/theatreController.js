const Theatre = require("../models/Theatre")
const geoConfig = require("../config/geoConfig")
const { buildNearSphereQuery, calculateDistanceKm } = require("../utils/geoUtils")
const { syncCinemasFromOsm } = require("../services/theatreSyncService")

const getAllTheatres = async (req, res, next) => {
    try {
        const { city } = req.query
        const query = { isActive: true }

        if (city) {
            query.city = new RegExp(`^${String(city).trim()}$`, "i")
        }

        const theatres = await Theatre.find(query)
            .populate("owner", "name email role")
            .sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            count: theatres.length,
            theatres
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
                distanceKm: distance !== null ? distance : null
            }
        })

        res.status(200).json({
            success: true,
            origin: {
                lat: params.lat,
                lng: params.lng,
                radiusKm: params.radiusKm
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
        const { name, city, address, screens, coordinates } = req.body

        if (!name || !city || !address) {
            return res.status(400).json({
                success: false,
                message: "Name, city, and address are required"
            })
        }

        const formattedScreens = Array.isArray(screens) && screens.length > 0
            ? screens.map((s, idx) => ({
                screenNumber: Number(s.screenNumber) || (idx + 1),
                totalSeats: Number(s.totalSeats)
            }))
            : []

        const finalCoordinates = Array.isArray(coordinates) && coordinates.length === 2
            ? [Number(coordinates[0]), Number(coordinates[1])]
            : [geoConfig.defaultCoordinates.lng, geoConfig.defaultCoordinates.lat]

        const theatre = await Theatre.create({
            name: String(name).trim(),
            city: String(city).trim(),
            address: String(address).trim(),
            location: {
                type: "Point",
                coordinates: finalCoordinates
            },
            screens: formattedScreens,
            owner: req.user?._id,
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
        const { name, city, address, screens, isActive, coordinates } = req.body

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
            theatre.location = {
                type: "Point",
                coordinates: [Number(coordinates[0]), Number(coordinates[1])]
            }
        }

        if (Array.isArray(screens)) {
            theatre.screens = screens.map((s, idx) => ({
                screenNumber: Number(s.screenNumber) || (idx + 1),
                totalSeats: Number(s.totalSeats)
            }))
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
        const cities = await Theatre.distinct("city", { isActive: true })
        res.status(200).json({
            success: true,
            cities: cities.sort()
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
    deleteTheatre,
    getDistinctCities,
    triggerOsmSync
}