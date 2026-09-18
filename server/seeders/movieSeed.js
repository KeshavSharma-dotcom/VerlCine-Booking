const path = require("path")
const fs = require("fs")

const envPaths = [
    path.resolve(__dirname, "../../.env"),
    path.resolve(__dirname, "../.env"),
    path.resolve(process.cwd(), ".env")
]

for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
        require("dotenv").config({ path: envPath })
        break
    }
}
require("dotenv").config()

const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const config = require("../config/config")
const User = require("../models/User")
const Movie = require("../models/Movie")
const Theatre = require("../models/Theatre")
const Showtime = require("../models/Showtime")
const { syncCinemasFromOsm } = require("../services/theatreSyncService")
const { fetchNowPlayingMovies } = require("../services/tmdbMovieService")
const geoConfig = require("../config/geoConfig")

const MONGO_URI = process.env.MONGO_URL || process.env.MONGODB_URI || config?.db?.mongoUrl

const generateSeats = (totalSeats) => {
    return Array.from({ length: totalSeats }, (_, idx) => ({
        seatNumber: `${String.fromCharCode(65 + Math.floor(idx / 10))}${(idx % 10) + 1}`,
        status: "available",
        lockedBy: null,
        lockedUntil: null
    }))
}

const seedRealShowtimes = async () => {
    try {
        if (!MONGO_URI) {
            throw new Error("MONGO_URI is missing")
        }

        await mongoose.connect(MONGO_URI)

        let adminOwner = await User.findOne({ email: "admin.mumbai@cineverl.com" })
        if (!adminOwner) {
            const hashedPassword = await bcrypt.hash("AdminPassword123!", 10)
            adminOwner = await User.create({
                name: "Mumbai Theatre Admin",
                email: "admin.mumbai@cineverl.com",
                password: hashedPassword,
                role: "theatre-admin",
                isVerified: true
            })
        }

        await syncCinemasFromOsm({
            lat: geoConfig.defaultCoordinates.lat,
            lng: geoConfig.defaultCoordinates.lng,
            radiusKm: geoConfig.defaultRadiusKm,
            defaultCity: geoConfig.defaultCity,
            ownerId: adminOwner._id
        })

        const physicalTheatres = await Theatre.find({ isActive: true })

        if (physicalTheatres.length === 0) {
            throw new Error("No physical theatres available in database")
        }

        const liveMovies = await fetchNowPlayingMovies("IN")

        if (liveMovies.length === 0) {
            throw new Error("Failed to fetch current theatrical releases from TMDB")
        }

        await Promise.all([
            Movie.deleteMany({ genre: { $nin: ["Standup Comedy", "Live Show", "Music Concert", "Theatre Play"] } }),
            Showtime.deleteMany({})
        ])

        const insertedMovies = await Movie.insertMany(liveMovies)

        const showtimesToInsert = []
        const today = new Date()

        for (let i = 0; i < insertedMovies.length; i++) {
            const movie = insertedMovies[i]
            const theatre = physicalTheatres[i % physicalTheatres.length]
            const screen = (theatre.screens && theatre.screens.length > 0)
                ? theatre.screens[0]
                : { screenNumber: 1, totalSeats: 60 }

            const slots = [
                { hour: 11, minute: 30, price: 250 },
                { hour: 15, minute: 45, price: 320 },
                { hour: 19, minute: 15, price: 420 },
                { hour: 22, minute: 30, price: 380 }
            ]

            for (const slot of slots) {
                const showDate = new Date(today)
                showDate.setHours(slot.hour, slot.minute, 0, 0)
                if (showDate < today) {
                    showDate.setDate(showDate.getDate() + 1)
                }

                showtimesToInsert.push({
                    movie: movie._id,
                    theatre: theatre._id,
                    screenNumber: screen.screenNumber,
                    startTime: showDate,
                    ticketPrice: slot.price,
                    seats: generateSeats(screen.totalSeats)
                })
            }
        }

        await Showtime.insertMany(showtimesToInsert)

        console.log(`Successfully synced ${insertedMovies.length} real-world currently screening films across ${physicalTheatres.length} physical OSM cinemas.`)
        process.exit(0)
    } catch (err) {
        console.error("Live theatrical sync failed:", err.message)
        process.exit(1)
    }
}

seedRealShowtimes()