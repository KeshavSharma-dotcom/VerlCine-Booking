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
const config = require("../config/config")
const Movie = require("../models/Movie")
const Theatre = require("../models/Theatre")
const Showtime = require("../models/Showtime")

const MONGO_URI = process.env.MONGO_URL 
const TIME_WINDOWS = [
    { name: "Morning", hours: [9, 10, 11], basePrice: 200 },
    { name: "Matinee", hours: [13, 14, 15], basePrice: 260 },
    { name: "Evening", hours: [17, 18, 19], basePrice: 380 },
    { name: "Night", hours: [20, 21, 22], basePrice: 320 }
]

const MINUTE_OFFSETS = [0, 15, 30, 45]

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)]
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const generateSeats = (totalSeats = 60) => {
    return Array.from({ length: totalSeats }, (_, idx) => {
        const rowChar = String.fromCharCode(65 + Math.floor(idx / 10))
        const colNum = (idx % 10) + 1
        const isOccupied = Math.random() < 0.22

        return {
            seatNumber: `${rowChar}${colNum}`,
            status: isOccupied ? "booked" : "available",
            lockedBy: null,
            lockedUntil: null
        }
    })
}

const seedShowtimes = async () => {
    try {
        console.log("Connecting to database for showtime generation...")
        await mongoose.connect(MONGO_URI)

        const [movies, theatres] = await Promise.all([
            Movie.find({ isActive: true }).select("_id title durationMinutes"),
            Theatre.find({ isActive: true }).select("_id name city screens")
        ])

        if (movies.length === 0) {
            throw new Error("Zero active movies found. Please seed movies first.")
        }
        if (theatres.length === 0) {
            throw new Error("Zero active theatres found. Please seed or sync theatres first.")
        }

        console.log(`Found ${movies.length} movies and ${theatres.length} theatres.`)

        await Showtime.deleteMany({})
        console.log("Cleared outdated showtimes.")

        const showtimesBatch = []
        const now = new Date()

        for (const theatre of theatres) {
            const availableScreens =
                Array.isArray(theatre.screens) && theatre.screens.length > 0
                    ? theatre.screens
                    : [
                        { screenNumber: 1, totalSeats: 60 },
                        { screenNumber: 2, totalSeats: 50 },
                        { screenNumber: 3, totalSeats: 60 }
                    ]

            const sampleSize = Math.min(getRandomInt(3, 6), movies.length)
            const shuffledMovies = [...movies].sort(() => 0.5 - Math.random())
            const assignedMovies = shuffledMovies.slice(0, sampleSize)

            for (const movie of assignedMovies) {
                const assignedScreen = getRandomElement(availableScreens)

                for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
                    const targetDate = new Date(now)
                    targetDate.setDate(now.getDate() + dayOffset)

                    const selectedWindows = TIME_WINDOWS.filter(() => Math.random() > 0.25)
                    const windowsToSchedule = selectedWindows.length > 0 ? selectedWindows : [TIME_WINDOWS[1], TIME_WINDOWS[2]]

                    for (const window of windowsToSchedule) {
                        const startHour = getRandomElement(window.hours)
                        const startMin = getRandomElement(MINUTE_OFFSETS)

                        const showDate = new Date(targetDate)
                        showDate.setHours(startHour, startMin, 0, 0)

                        if (showDate <= now) continue

                        const variance = getRandomElement([-20, 0, 20, 40])
                        const ticketPrice = window.basePrice + variance

                        showtimesBatch.push({
                            movie: movie._id,
                            theatre: theatre._id,
                            screenNumber: assignedScreen.screenNumber || 1,
                            startTime: showDate,
                            ticketPrice,
                            seats: generateSeats(assignedScreen.totalSeats || 60)
                        })
                    }
                }
            }
        }

        if (showtimesBatch.length === 0) {
            throw new Error("No upcoming showtime slots could be computed.")
        }

        await Showtime.insertMany(showtimesBatch)

        console.log(`\nShowtime Seeding Completed!`)
        console.log(`- Scheduled: ${showtimesBatch.length} dynamic showtimes`)
        console.log(`- Coverage: ${theatres.length} physical venues across active cities`)
        console.log(`- Time Horizon: Today and Tomorrow`)
        process.exit(0)
    } catch (err) {
        console.error("Showtime seeding error:", err.message)
        process.exit(1)
    }
}

seedShowtimes()