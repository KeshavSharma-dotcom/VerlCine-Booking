const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const config = require("../config/config")

const User = require("../models/User")
const Movie = require("../models/Movie")
const Theatre = require("../models/Theatre")
const Showtime = require("../models/Showtime")

const MONGO_URI = config.db.mongoUrl || process.env.MONGO_URL

const liveShowsData = [
    {
        title: "Kisi Ko Batana Mat ft. Anubhav Singh Bassi",
        description: "Bassi returns to the stage with a brand-new raw storytelling routine about friendship, hostel blunders, and chaotic career choices.",
        genre: ["Standup Comedy", "Live Show"],
        durationMinutes: 90,
        rating: "PG-13",
        posterUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=800&q=80",
        isActive: true
    },
    {
        title: "Kal Ki Chinta Nahi Karta ft. Ravi Gupta",
        description: "Pure desi humor exploring relatable middle-class dilemmas, daily life observations, and nostalgic storytelling.",
        genre: ["Standup Comedy", "Live Show"],
        durationMinutes: 80,
        rating: "PG-13",
        posterUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
        isActive: true
    },
    {
        title: "Unstoppable Laughs ft. Zakir Khan",
        description: "An evening filled with Zakir's signature poetic charm, heart-warming camaraderie, and hilarious take on human relationships.",
        genre: ["Standup Comedy", "Storytelling"],
        durationMinutes: 110,
        rating: "PG-13",
        posterUrl: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=800&q=80",
        isActive: true
    },
    {
        title: "Sufi & Qawwali Mystics Night",
        description: "Immerse in transcendental Sufi melodies and spiritual qawwali harmonies performed live by renowned vocal maestros.",
        genre: ["Music Concert", "Cultural"],
        durationMinutes: 150,
        rating: "G",
        posterUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
        isActive: true
    },
    {
        title: "Jaipur Open Mic & Crowdwork Specials",
        description: "An interactive, unscripted stand-up session featuring top improvisers delivering unfiltered crowd roast and wit.",
        genre: ["Standup Comedy", "Improv"],
        durationMinutes: 75,
        rating: "R",
        posterUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
        isActive: true
    },
    {
        title: "Rajasthan Folk Fusion & Instrumental Live",
        description: "A blend of traditional Rajasthani instruments including Kamaicha, Ravanhatha, and Khartal merged with ambient global soundscapes.",
        genre: ["Music Concert", "Instrumental"],
        durationMinutes: 120,
        rating: "G",
        posterUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
        isActive: true
    },
    {
        title: "Fresh Material Only ft. Harsh Gujral",
        description: "High-octane punches, spontaneous crowd interactions, and unfiltered North Indian observational comedy.",
        genre: ["Standup Comedy", "Live Show"],
        durationMinutes: 85,
        rating: "PG-13",
        posterUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
        isActive: true
    },
    {
        title: "Dastangoi: Tales of Ancient Rajasthan",
        description: "The traditional Urdu oral storytelling art form celebrating bravery, romantic epics, and folklore beneath starlit arches.",
        genre: ["Theatre Play", "Storytelling"],
        durationMinutes: 100,
        rating: "G",
        posterUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=800&q=80",
        isActive: true
    },
    {
        title: "Classic Rock & Indie Symphony Tribute",
        description: "A sweeping orchestral performance covering anthems from Pink Floyd, Queen, and Indian rock pioneers.",
        genre: ["Music Concert", "Rock"],
        durationMinutes: 130,
        rating: "PG",
        posterUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
        isActive: true
    },
    {
        title: "Courtroom Comedy & The Legal Roast",
        description: "A satirical sketch comedy act ripping into hilarious laws, corporate contracts, and urban disputes.",
        genre: ["Theatre Play", "Satire"],
        durationMinutes: 95,
        rating: "PG-13",
        posterUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
        isActive: true
    }
]

const venuesData = [
    {
        name: "Jawahar Kala Kendra (JKK)",
        city: "Jaipur",
        address: "Jawahar Lal Nehru Marg, Jhalana Doongri, Jaipur, Rajasthan 302004",
        screens: [{ screenNumber: 1, totalSeats: 80 }],
        isActive: true
    },
    {
        name: "Birla Auditorium",
        city: "Jaipur",
        address: "Statue Circle, C Scheme, Rambagh, Jaipur, Rajasthan 302001",
        screens: [{ screenNumber: 1, totalSeats: 100 }],
        isActive: true
    },
    {
        name: "Jaipur Comedy Club",
        city: "Jaipur",
        address: "JLN Marg, Malviya Nagar, Jaipur, Rajasthan 302017",
        screens: [{ screenNumber: 1, totalSeats: 50 }],
        isActive: true
    },
    {
        name: "Deep Smriti Auditorium",
        city: "Jaipur",
        address: "Arawali Marg, Mansarovar Sector 4, Mansarovar, Jaipur, Rajasthan 302020",
        screens: [{ screenNumber: 1, totalSeats: 70 }],
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

const seedLiveShows = async () => {
    try {
        if (!MONGO_URI) {
            throw new Error("MongoDB connection URL is missing in config/environment")
        }

        await mongoose.connect(MONGO_URI)

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

        const insertedVenues = []
        for (const venue of venuesData) {
            let existingVenue = await Theatre.findOne({ name: venue.name, city: "Jaipur" })
            if (!existingVenue) {
                existingVenue = await Theatre.create({
                    ...venue,
                    owner: adminOwner._id
                })
            }
            insertedVenues.push(existingVenue)
        }

        const insertedShows = []
        for (const item of liveShowsData) {
            let existingShow = await Movie.findOne({ title: item.title })
            if (!existingShow) {
                existingShow = await Movie.create(item)
            }
            insertedShows.push(existingShow)
        }

        const showtimesToInsert = []
        const baseDate = new Date()

        for (let i = 0; i < insertedShows.length; i++) {
            const show = insertedShows[i]
            const venue = insertedVenues[i % insertedVenues.length]
            const screen = venue.screens[0]

            const scheduleSlots = [
                { daysAhead: 1, hour: 18, minute: 0, price: 499 },
                { daysAhead: 2, hour: 20, minute: 30, price: 799 },
                { daysAhead: 3, hour: 19, minute: 0, price: 999 }
            ]

            for (const slot of scheduleSlots) {
                const showDate = new Date(baseDate)
                showDate.setDate(baseDate.getDate() + slot.daysAhead)
                showDate.setHours(slot.hour, slot.minute, 0, 0)

                showtimesToInsert.push({
                    movie: show._id,
                    theatre: venue._id,
                    screenNumber: screen.screenNumber,
                    startTime: showDate,
                    ticketPrice: slot.price,
                    seats: generateSeats(screen.totalSeats)
                })
            }
        }

        await Showtime.insertMany(showtimesToInsert)

        console.log(`Live shows seeded successfully! Added ${insertedShows.length} live events across ${insertedVenues.length} stages.`)
        process.exit(0)
    } catch (error) {
        console.error("Live show seeding failed:", error)
        process.exit(1)
    }
}

seedLiveShows()