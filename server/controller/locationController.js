const Theatre = require("../models/Theatre")
const { calculateDistanceKm } = require("../utils/geoUtils")

const DEFAULT_LOCATION = {
    city: "Delhi NCR",
    lat: 28.6139,
    lng: 77.2090,
    radiusKm: 40
}

const POPULAR_CITIES = [
    {
        name: "Delhi NCR",
        lat: 28.6139,
        lng: 77.2090,
        iconSvg: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 56V22h40v34M16 16h32v6H16zM20 10h24v6H20z" /><path d="M24 56V34c0-4.4 3.6-8 8-8s8 3.6 8 8v22" /><path d="M8 56h48" /></svg>'
    },
    {
        name: "Mumbai",
        lat: 18.9690,
        lng: 72.8194,
        iconSvg: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 56V24l10-8 12 4 12-4 10 8v32" /><path d="M24 56V36a8 8 0 0 1 16 0v20" /><path d="M10 28h44M18 16v8M46 16v8M6 56h52" /></svg>'
    },
    {
        name: "Bengaluru",
        lat: 12.9716,
        lng: 77.5946,
        iconSvg: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 56V28h44v28M32 10l8 18H24l8-18z" /><path d="M18 56V38h28v18M26 38V28M38 38V28M4 56h56" /><path d="M14 18v10M50 18v10" /></svg>'
    },
    {
        name: "Ahmedabad",
        lat: 23.0225,
        lng: 72.5714,
        iconSvg: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 56V26l24-14 24 14v30" /><path d="M22 56V36a10 10 0 0 1 20 0v20" /><path d="M16 26h32M16 20h32M32 12v6" /><path d="M12 40h6M46 40h6" /></svg>'
    },
    {
        name: "Chandigarh",
        lat: 30.7333,
        lng: 76.7794,
        iconSvg: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 54V38c0-8 6-14 14-14s14 6 14 14v16" /><path d="M24 24c-4-4-4-10 0-14 4 4 10 4 14 0 4 4 10 4 14 0 4 4 4 10 0 14" /><path d="M12 56h40M32 38v16" /></svg>'
    },
    {
        name: "Chennai",
        lat: 13.0827,
        lng: 80.2707,
        iconSvg: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M26 10h12l-2 8H28l-2-8zM24 18h16l-3 10H27l-3-10zM20 28h24l-4 12H24l-4-12zM16 40h32l-3 16H19l-3-16z" /><path d="M10 56h44M30 46h4v10h-4z" /></svg>'
    },
    {
        name: "Pune",
        lat: 18.5204,
        lng: 73.8567,
        iconSvg: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 56V28l18-12 18 12v28" /><path d="M24 56V38a8 8 0 0 1 16 0v18" /><path d="M14 36h36M8 56h48M26 16v12M38 16v12" /></svg>'
    },
    {
        name: "Kolkata",
        lat: 22.5726,
        lng: 88.3639,
        iconSvg: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M32 10c-5 0-8 6-8 12h16c0-6-3-12-8-12z" /><path d="M8 40V28l12-6 12 4 12-4 12 6v12" /><path d="M8 40h48v16H8z" /><path d="M20 56V46h8v10M36 56V46h8v10" /></svg>'
    },
    {
        name: "Hyderabad",
        lat: 17.3850,
        lng: 78.4867,
        iconSvg: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 12v44M52 12v44M10 12h6M50 12h6" /><path d="M16 24h32v8H16z" /><path d="M22 56V38a10 10 0 0 1 20 0v18" /><path d="M14 32v24M48 32v24M8 56h48" /></svg>'
    },
    {
        name: "Goa",
        lat: 15.2993,
        lng: 74.1240,
        iconSvg: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M30 56c0-14 4-22 10-30" /><path d="M40 26c-8-6-16-4-20 2 6 6 16 4 20-2z" /><path d="M40 26c-4-8-12-10-18-6 4 8 12 10 18 6z" /><path d="M40 26c2-8 0-14-6-18 0 8 2 14 6 18z" /><path d="M40 26c6-6 6-12 2-18-2 6-4 12-2 18z" /><path d="M10 56c8-4 16-2 22 0M32 56c8-4 16-2 22 0" /></svg>'
    },
    {
        name: "Jaipur",
        lat: 26.9124,
        lng: 75.7873,
        iconSvg: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M16 56V26l16-12 16 12v30" /><path d="M26 56V38a6 6 0 0 1 12 0v18" /><path d="M20 28h24M32 14v10" /><path d="M10 56h44" /></svg>'
    }
]

const INDIAN_CITIES_CATALOG = [
    { name: "Abohar", state: "Punjab", lat: 30.1453, lng: 74.1993 },
    { name: "Abu Road", state: "Rajasthan", lat: 24.4826, lng: 72.7753 },
    { name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081 },
    { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
    { name: "Ajmer", state: "Rajasthan", lat: 26.4499, lng: 74.6399 },
    { name: "Aligarh", state: "Uttar Pradesh", lat: 27.8974, lng: 78.0880 },
    { name: "Allahabad", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463 },
    { name: "Ambala", state: "Haryana", lat: 30.3782, lng: 76.7767 },
    { name: "Amritsar", state: "Punjab", lat: 31.6340, lng: 74.8723 },
    { name: "Aurangabad", state: "Maharashtra", lat: 19.8762, lng: 75.3433 },
    { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
    { name: "Bareilly", state: "Uttar Pradesh", lat: 28.3670, lng: 79.4304 },
    { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
    { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245 },
    { name: "Bikaner", state: "Rajasthan", lat: 28.0229, lng: 73.3119 },
    { name: "Chandigarh", state: "Punjab", lat: 30.7333, lng: 76.7794 },
    { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
    { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
    { name: "Cuttack", state: "Odisha", lat: 20.4625, lng: 85.8828 },
    { name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322 },
    { name: "Delhi NCR", state: "Delhi", lat: 28.6139, lng: 77.2090 },
    { name: "Dhanbad", state: "Jharkhand", lat: 23.7957, lng: 86.4304 },
    { name: "Faridabad", state: "Haryana", lat: 28.4089, lng: 77.3178 },
    { name: "Gandhinagar", state: "Gujarat", lat: 23.2156, lng: 72.6369 },
    { name: "Ghaziabad", state: "Uttar Pradesh", lat: 28.6692, lng: 77.4538 },
    { name: "Goa", state: "Goa", lat: 15.2993, lng: 74.1240 },
    { name: "Gorakhpur", state: "Uttar Pradesh", lat: 26.7606, lng: 83.3732 },
    { name: "Gwalior", state: "Madhya Pradesh", lat: 26.2183, lng: 78.1828 },
    { name: "Haridwar", state: "Uttarakhand", lat: 29.9457, lng: 78.1642 },
    { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 },
    { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
    { name: "Jabalpur", state: "Madhya Pradesh", lat: 23.1815, lng: 79.9864 },
    { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
    { name: "Jalandhar", state: "Punjab", lat: 31.3260, lng: 75.5762 },
    { name: "Jammu", state: "Jammu and Kashmir", lat: 32.7266, lng: 74.8570 },
    { name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243 },
    { name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319 },
    { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
    { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
    { name: "Kota", state: "Rajasthan", lat: 25.2138, lng: 75.8648 },
    { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
    { name: "Ludhiana", state: "Punjab", lat: 30.9010, lng: 75.8573 },
    { name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },
    { name: "Mangalore", state: "Karnataka", lat: 12.9141, lng: 74.8560 },
    { name: "Meerut", state: "Uttar Pradesh", lat: 28.9845, lng: 77.7064 },
    { name: "Mumbai", state: "Maharashtra", lat: 18.9690, lng: 72.8194 },
    { name: "Mysuru", state: "Karnataka", lat: 12.2958, lng: 76.6394 },
    { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
    { name: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898 },
    { name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910 },
    { name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376 },
    { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
    { name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296 },
    { name: "Rajkot", state: "Gujarat", lat: 22.3039, lng: 70.8022 },
    { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096 },
    { name: "Sikar", state: "Rajasthan", lat: 27.6094, lng: 75.1399 },
    { name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311 },
    { name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366 },
    { name: "Udaipur", state: "Rajasthan", lat: 24.5854, lng: 73.7125 },
    { name: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812 },
    { name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
    { name: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lng: 80.6480 },
    { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 }
]

const getAlphabetList = (req, res) => {
    const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
    res.status(200).json({
        success: true,
        alphabets
    })
}

const getPopularCities = (req, res) => {
    res.status(200).json({
        success: true,
        count: POPULAR_CITIES.length,
        cities: POPULAR_CITIES
    })
}

const getAllIndianCities = async (req, res, next) => {
    try {
        const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
        const grouped = {}

        alphabets.forEach((char) => {
            grouped[char] = []
        })

        const operationalCities = await Theatre.distinct("city", { isActive: true })

        const catalogMap = new Map()
        INDIAN_CITIES_CATALOG.forEach((c) => {
            catalogMap.set(c.name.toLowerCase(), c)
        })

        operationalCities.forEach((cityStr) => {
            const key = String(cityStr).trim().toLowerCase()
            if (!catalogMap.has(key)) {
                catalogMap.set(key, {
                    name: String(cityStr).trim(),
                    state: "India",
                    lat: null,
                    lng: null
                })
            }
        })

        const unifiedList = Array.from(catalogMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        )

        unifiedList.forEach((item) => {
            const firstLetter = item.name.charAt(0).toUpperCase()
            if (grouped[firstLetter]) {
                grouped[firstLetter].push(item)
            }
        })

        res.status(200).json({
            success: true,
            totalCities: unifiedList.length,
            grouped,
            cities: unifiedList
        })
    } catch (err) {
        next(err)
    }
}

const getTheatresUnder40Km = async (req, res, next) => {
    try {
        const lat = parseFloat(req.query.lat) || DEFAULT_LOCATION.lat
        const lng = parseFloat(req.query.lng) || DEFAULT_LOCATION.lng
        const radiusKm = parseFloat(req.query.radius) || DEFAULT_LOCATION.radiusKm
        const city = req.query.city || DEFAULT_LOCATION.city

        const aggregationPipeline = [
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    distanceField: "distanceMeters",
                    maxDistance: radiusKm * 1000,
                    spherical: true,
                    query: { isActive: true }
                }
            },
            {
                $addFields: {
                    distanceKm: { $round: [{ $divide: ["$distanceMeters", 1000] }, 1] }
                }
            },
            {
                $sort: { distanceKm: 1 }
            }
        ]

        let theatres = await Theatre.aggregate(aggregationPipeline)

        if (theatres.length === 0 && city) {
            theatres = await Theatre.find({
                city: new RegExp(`^${String(city).trim()}$`, "i"),
                isActive: true
            }).lean()

            theatres = theatres.map((t) => {
                let distanceKm = null
                if (t.location?.coordinates) {
                    const [tLng, tLat] = t.location.coordinates
                    distanceKm = calculateDistanceKm(lat, lng, tLat, tLng)
                }
                return {
                    ...t,
                    distanceKm
                }
            })
        }

        res.status(200).json({
            success: true,
            origin: {
                city,
                lat,
                lng,
                radiusKm
            },
            count: theatres.length,
            theatres
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getAlphabetList,
    getPopularCities,
    getAllIndianCities,
    getTheatresUnder40Km,
    DEFAULT_LOCATION
}