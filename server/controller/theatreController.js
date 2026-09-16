const Theatre = require("../models/Theatre")

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
        const { name, city, address, screens } = req.body

        if (!name || !city || !address) {
            return res.status(400).json({
                success: false,
                message: "Name, city, and address are required"
            })
        }

        const formattedScreens = Array.isArray(screens) && screens.length > 0
            ? screens.map((s, idx) => ({
                screenNumber: Number(s.screenNumber) || (idx + 1),
                totalSeats: Number(s.totalSeats) || 60
            }))
            : [{ screenNumber: 1, totalSeats: 60 }]

        const theatre = await Theatre.create({
            name: String(name).trim(),
            city: String(city).trim(),
            address: String(address).trim(),
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
        const { name, city, address, screens, isActive } = req.body

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

        if (Array.isArray(screens) && screens.length > 0) {
            theatre.screens = screens.map((s, idx) => ({
                screenNumber: Number(s.screenNumber) || (idx + 1),
                totalSeats: Number(s.totalSeats) || 60
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

module.exports = {
    getAllTheatres,
    getTheatreById,
    createTheatre,
    updateTheatre,
    deleteTheatre,
    getDistinctCities
}