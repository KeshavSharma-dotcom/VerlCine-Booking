const Showtime = require("../models/Showtime")

const getShowtimes = async (req, res, next) => {
    try {
        const { movie, movieId, city, lat, lng } = req.query
        const targetMovieId = movie || movieId

        const filter = {
            startTime: { $gte: new Date() }
        }

        if (targetMovieId) {
            filter.movie = targetMovieId
        }

        let showtimes = await Showtime.find(filter)
            .populate({
                path: "theatre",
                select: "name city address location screens isActive"
            })
            .populate("movie", "title posterUrl durationMinutes rating genre description")
            .sort({ startTime: 1 })
            .lean()

        if (city && city.trim()) {
            const regex = new RegExp(`^${city.trim()}$`, "i")
            showtimes = showtimes.filter((st) => st.theatre && regex.test(st.theatre.city))
        }

        const userLat = parseFloat(lat)
        const userLng = parseFloat(lng)
        const hasCoords = !isNaN(userLat) && !isNaN(userLng)

        const toRad = (v) => (v * Math.PI) / 180
        const calcDistance = (tLat, tLng) => {
            if (!hasCoords || !tLat || !tLng) return null
            const R = 6371
            const dLat = toRad(tLat - userLat)
            const dLon = toRad(tLng - userLng)
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(userLat)) * Math.cos(toRad(tLat)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            return parseFloat((R * c).toFixed(1))
        }

        const theatreMap = new Map()

        for (const st of showtimes) {
            if (!st.theatre) continue

            const theatreId = st.theatre._id.toString()

            if (!theatreMap.has(theatreId)) {
                let distanceKm = null
                if (st.theatre.location?.coordinates) {
                    const [tLng, tLat] = st.theatre.location.coordinates
                    distanceKm = calcDistance(tLat, tLng)
                }

                theatreMap.set(theatreId, {
                    theatre: {
                        ...st.theatre,
                        distanceKm
                    },
                    screens: {}
                })
            }

            const theatreGroup = theatreMap.get(theatreId)
            const screenName = `Screen ${st.screenNumber}`

            if (!theatreGroup.screens[screenName]) {
                theatreGroup.screens[screenName] = []
            }

            const availableSeatsCount = Array.isArray(st.seats)
                ? st.seats.filter((s) => s.status === "available").length
                : 0

            theatreGroup.screens[screenName].push({
                _id: st._id,
                startTime: st.startTime,
                ticketPrice: st.ticketPrice,
                screenNumber: st.screenNumber,
                availableSeatsCount,
                totalSeats: st.seats?.length || 60
            })
        }

        const groupedTheatres = Array.from(theatreMap.values())

        if (hasCoords) {
            groupedTheatres.sort((a, b) => {
                const distA = a.theatre.distanceKm ?? 9999
                const distB = b.theatre.distanceKm ?? 9999
                return distA - distB
            })
        }

        res.status(200).json({
            success: true,
            count: showtimes.length,
            theatresCount: groupedTheatres.length,
            showtimes,
            groupedTheatres
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getShowtimes
}