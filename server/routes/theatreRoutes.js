const express = require("express")
const router = express.Router()
const Theatre = require("../models/Theatre")

router.get("/", async (req, res, next) => {
    try {
        const theatres = await Theatre.find({ isActive: true }).sort({ createdAt: -1 })
        res.status(200).json({ success: true, theatres })
    } catch (err) {
        next(err)
    }
})

router.post("/", async (req, res, next) => {
    try {
        const { name, city, address, screens } = req.body
        if (!name || !city || !address) {
            return res.status(400).json({ success: false, message: "Missing required theatre details" })
        }

        const formattedScreens = Array.isArray(screens) && screens.length > 0
            ? screens
            : [{ screenNumber: 1, totalSeats: 60 }]

        const theatre = await Theatre.create({
            name: String(name).trim(),
            city: String(city).trim(),
            address: String(address).trim(),
            screens: formattedScreens,
            isActive: true
        })

        res.status(201).json({ success: true, message: "Theatre created successfully", theatre })
    } catch (err) {
        next(err)
    }
})

module.exports = router