const { isValidCoordinate } = require("../utils/geoUtils")

const parseEnvNumber = (val, fallback) => {
    if (val === undefined || val === null || val === "") return fallback
    const parsed = Number(val)
    return Number.isFinite(parsed) ? parsed : fallback
}

const rawLat = parseEnvNumber(process.env.DEFAULT_GEO_LAT, 18.9690)
const rawLng = parseEnvNumber(process.env.DEFAULT_GEO_LNG, 72.8194)
const rawRadius = parseEnvNumber(process.env.DEFAULT_GEO_RADIUS_KM, 50)

const defaultLat = isValidCoordinate(rawLat, 0) ? rawLat : 18.9690
const defaultLng = isValidCoordinate(0, rawLng) ? rawLng : 72.8194
const defaultRadiusKm = rawRadius > 0 && rawRadius <= 200 ? rawRadius : 50
const defaultCity = (process.env.DEFAULT_OPERATIONAL_CITY && process.env.DEFAULT_OPERATIONAL_CITY.trim()) || "Mumbai"

const geoConfig = Object.freeze({
    defaultCoordinates: Object.freeze({
        lat: defaultLat,
        lng: defaultLng
    }),
    defaultRadiusKm,
    defaultCity,
    minRadiusKm: 1,
    maxRadiusKm: 200,
    getSanitizedParams: (queryLat, queryLng, queryRadius, queryCity) => {
        const candidateLat = parseEnvNumber(queryLat, defaultLat)
        const candidateLng = parseEnvNumber(queryLng, defaultLng)
        const candidateRadius = parseEnvNumber(queryRadius, defaultRadiusKm)

        const validCoords = isValidCoordinate(candidateLat, candidateLng)

        const finalLat = validCoords ? candidateLat : defaultLat
        const finalLng = validCoords ? candidateLng : defaultLng
        const finalRadius = candidateRadius > 0 && candidateRadius <= 200 ? candidateRadius : defaultRadiusKm
        const finalCity = (queryCity && typeof queryCity === "string" && queryCity.trim().length > 0)
            ? queryCity.trim()
            : defaultCity

        return {
            lat: finalLat,
            lng: finalLng,
            radiusKm: finalRadius,
            city: finalCity
        }
    }
})

module.exports = geoConfig