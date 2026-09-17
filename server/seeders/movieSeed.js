const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const config = require("../config/config")

const User = require("../models/User")
const Movie = require("../models/Movie")
const Theatre = require("../models/Theatre")
const Showtime = require("../models/Showtime")

const MONGO_URI = config.db.mongoUrl || process.env.MONGO_URL

const moviesData = [
    {
        title: "Interstellar",
        description: "When Earth becomes uninhabitable, a team of explorers undertakes humanity's most important mission: traveling beyond our galaxy to discover a new home.",
        genre: ["Sci-Fi", "Adventure", "Drama"],
        durationMinutes: 169,
        rating: "PG-13",
        posterUrl: "https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        isActive: true
    },
    {
        title: "The Dark Knight",
        description: "When the menace known as the Joker wreaks havoc and chaos on Gotham City, Batman must accept one of the greatest psychological and physical tests.",
        genre: ["Action", "Crime", "Drama"],
        durationMinutes: 152,
        rating: "PG-13",
        posterUrl: "https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        isActive: true
    },
    {
        title: "Inception",
        description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
        genre: ["Action", "Sci-Fi", "Thriller"],
        durationMinutes: 148,
        rating: "PG-13",
        posterUrl: "https://image.tmdb.org/t/p/w780/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
        isActive: true
    },
    {
        title: "Oppenheimer",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
        genre: ["Biography", "Drama", "History"],
        durationMinutes: 180,
        rating: "R",
        posterUrl: "https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        isActive: true
    },
    {
        title: "Dune: Part Two",
        description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
        genre: ["Action", "Adventure", "Sci-Fi"],
        durationMinutes: 166,
        rating: "PG-13",
        posterUrl: "https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        isActive: true
    },
    {
        title: "Spider-Man: Across the Spider-Verse",
        description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
        genre: ["Animation", "Action", "Adventure"],
        durationMinutes: 140,
        rating: "PG",
        posterUrl: "https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
        isActive: true
    },
    {
        title: "Gladiator II",
        description: "Decades after Maximus's sacrifice, Lucius enters the Colosseum after his home is conquered by the tyrannical emperors of Rome.",
        genre: ["Action", "Adventure", "Drama"],
        durationMinutes: 150,
        rating: "R",
        posterUrl: "https://image.tmdb.org/t/p/w780/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
        isActive: true
    },
    {
        title: "Avatar: The Way of Water",
        description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns, he must fight a difficult war.",
        genre: ["Action", "Adventure", "Fantasy"],
        durationMinutes: 192,
        rating: "PG-13",
        posterUrl: "https://image.tmdb.org/t/p/w780/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
        isActive: true
    },
    {
        title: "Blade Runner 2049",
        description: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing thirty years.",
        genre: ["Action", "Drama", "Mystery"],
        durationMinutes: 164,
        rating: "R",
        posterUrl: "https://image.tmdb.org/t/p/w780/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
        isActive: true
    },
    {
        title: "Top Gun: Maverick",
        description: "After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past training elite pilots.",
        genre: ["Action", "Drama"],
        durationMinutes: 130,
        rating: "PG-13",
        posterUrl: "https://image.tmdb.org/t/p/w780/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
        isActive: true
    },
    {
        title: "Parasite",
        description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
        genre: ["Drama", "Thriller"],
        durationMinutes: 132,
        rating: "R",
        posterUrl: "https://image.tmdb.org/t/p/w780/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        isActive: true
    },
    {
        title: "Avengers: Endgame",
        description: "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more.",
        genre: ["Action", "Adventure", "Sci-Fi"],
        durationMinutes: 181,
        rating: "PG-13",
        posterUrl: "https://image.tmdb.org/t/p/w780/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
        isActive: true
    },
    {
        title: "The Batman",
        description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.",
        genre: ["Action", "Crime", "Drama"],
        durationMinutes: 176,
        rating: "PG-13",
        posterUrl: "https://image.tmdb.org/t/p/w780/74xTEgt7R36Fpooo50r9T25onhq.jpg",
        isActive: true
    },
    {
        title: "Mad Max: Fury Road",
        description: "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners.",
        genre: ["Action", "Adventure", "Sci-Fi"],
        durationMinutes: 120,
        rating: "R",
        posterUrl: "https://image.tmdb.org/t/p/w780/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg",
        isActive: true
    },
    {
        title: "Whiplash",
        description: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who stops at nothing.",
        genre: ["Drama", "Music"],
        durationMinutes: 107,
        rating: "R",
        posterUrl: "https://image.tmdb.org/t/p/w780/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
        isActive: true
    },
    {
        title: "Spider-Man: No Way Home",
        description: "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds appear.",
        genre: ["Action", "Adventure", "Fantasy"],
        durationMinutes: 148,
        rating: "PG-13",
        posterUrl: "https://image.tmdb.org/t/p/w780/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
        isActive: true
    }
]

const theatresData = [
    {
        name: "Raj Mandir Cinema",
        city: "Jaipur",
        address: "Bhagwan Das Road, Ashok Nagar, Jaipur, Rajasthan 302001",
        screens: [{ screenNumber: 1, totalSeats: 60 }],
        isActive: true
    },
    {
        name: "INOX Crystal Palm",
        city: "Jaipur",
        address: "Sardar Patel Marg, C Scheme, Ashok Nagar, Jaipur, Rajasthan 302001",
        screens: [{ screenNumber: 1, totalSeats: 50 }, { screenNumber: 2, totalSeats: 50 }],
        isActive: true
    },
    {
        name: "Cinepolis World Trade Park",
        city: "Jaipur",
        address: "Jawahar Lal Nehru Marg, D-Block, Malviya Nagar, Jaipur, Rajasthan 302017",
        screens: [{ screenNumber: 1, totalSeats: 60 }, { screenNumber: 2, totalSeats: 60 }],
        isActive: true
    },
    {
        name: "Entertainment Paradise (EP)",
        city: "Jaipur",
        address: "Jawahar Circle, Malviya Nagar, Jaipur, Rajasthan 302017",
        screens: [{ screenNumber: 1, totalSeats: 50 }],
        isActive: true
    }
]

const generateSeats = (totalSeats) => {
    return Array.from({ length: totalSeats }, (_, idx) => ({
        seatNumber: `${String.fromCharCode(65 + Math.floor(idx / 10))}${(idx % 10) + 1}`,
        status: "available",
        lockedBy: null,
        lockedUntil: null
    }))
}

const seedDatabase = async () => {
    try {
        if (!MONGO_URI) {
            throw new Error("MongoDB connection URL is missing in config/environment")
        }

        await mongoose.connect(MONGO_URI)

        await Promise.all([
            Movie.deleteMany({ genre: { $nin: ["Standup Comedy", "Live Show", "Music Concert", "Theatre Play"] } }),
            Theatre.deleteMany({ name: { $in: theatresData.map(t => t.name) } })
        ])

        let adminOwner = await User.findOne({ email: "admin.jaipur@cineverl.com" })
        if (!adminOwner) {
            const hashedPassword = await bcrypt.hash("AdminPassword123!", 10)
            adminOwner = await User.create({
                name: "Jaipur Theatre Admin",
                email: "admin.jaipur@cineverl.com",
                password: hashedPassword,
                role: "theatre-admin",
                isVerified: true
            })
        }

        const preparedTheatres = theatresData.map(t => ({
            ...t,
            owner: adminOwner._id
        }))
        const insertedTheatres = await Theatre.insertMany(preparedTheatres)

        const insertedMovies = await Movie.insertMany(moviesData)

        const showtimesToInsert = []
        const today = new Date()

        for (let i = 0; i < insertedMovies.length; i++) {
            const movie = insertedMovies[i]
            const theatre = insertedTheatres[i % insertedTheatres.length]
            const screen = theatre.screens[0]

            const slots = [
                { hour: 11, minute: 30, price: 250 },
                { hour: 15, minute: 45, price: 320 },
                { hour: 19, minute: 15, price: 400 },
                { hour: 22, minute: 30, price: 350 }
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

        console.log(`Movie seeding successful! Inserted ${insertedMovies.length} movies, ${insertedTheatres.length} Jaipur theatres, and ${showtimesToInsert.length} showtimes.`)
        process.exit(0)
    } catch (error) {
        console.error("Movie seeding failed:", error)
        process.exit(1)
    }
}

seedDatabase()