const Showtime = require("../models/Showtime")
const Theatre = require("../models/Theatre")

const getShowtimes = async (req, res, next) => {
    try {
        const { movie, movieId, city, lat, lng } = req.query
        const targetMovieId = movie || movieId

        const filter = {}
        if (targetMovieId) {
            filter.movie = targetMovieId
        }

        let showtimes = await Showtime.find(filter)
            .populate({
                path: "theatre",
                select: "name city address location screens isActive"
            })
            .populate("movie", "title posterUrl durationMinutes rating genre")
            .sort({ startTime: 1 })
            .lean()

        if (city && city.trim()) {
            const regex = new RegExp(`^${city.trim()}$`, "i")
            showtimes = showtimes.filter((st) => st.theatre && regex.test(st.theatre.city))
        }

        const userLat = parseFloat(lat)
        const userLng = parseFloat(lng)

        if (!isNaN(userLat) && !isNaN(userLng)) {
            const toRad = (v) => (v * Math.PI) / 180
            showtimes.forEach((st) => {
                if (st.theatre?.location?.coordinates) {
                    const [tLng, tLat] = st.theatre.location.coordinates
                    const R = 6371 // Earth radius in km
                    const dLat = toRad(tLat - userLat)
                    const dLon = toRad(tLng - userLng)
                    const a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(toRad(userLat)) * Math.cos(toRad(tLat)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2)
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                    st.theatre.distanceKm = parseFloat((R * c).toFixed(1))
                }
            })
        }

        res.status(200).json({
            success: true,
            count: showtimes.length,
            showtimes
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getShowtimes
}