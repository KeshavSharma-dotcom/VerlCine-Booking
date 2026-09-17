const EARTH_RADIUS_KM = 6371

const isValidCoordinate = (lat, lng) => {
    if (lat === null || lng === null || lat === undefined || lng === undefined) return false
    if (typeof lat === "boolean" || typeof lng === "boolean") return false
    if (typeof lat === "string" && lat.trim() === "") return false
    if (typeof lng === "string" && lng.trim() === "") return false

    const numericLat = Number(lat)
    const numericLng = Number(lng)

    if (!Number.isFinite(numericLat) || !Number.isFinite(numericLng)) return false
    if (numericLat < -90 || numericLat > 90) return false
    if (numericLng < -180 || numericLng > 180) return false

    return true
}

const toRadians = (degrees) => {
    return degrees * (Math.PI / 180)
}

const calculateDistanceKm = (lat1, lng1, lat2, lng2) => {
    if (!isValidCoordinate(lat1, lng1) || !isValidCoordinate(lat2, lng2)) {
        return null
    }

    const nLat1 = Number(lat1)
    const nLng1 = Number(lng1)
    const nLat2 = Number(lat2)
    const nLng2 = Number(lng2)

    if (nLat1 === nLat2 && nLng1 === nLng2) {
        return 0
    }

    const dLat = toRadians(nLat2 - nLat1)
    const dLng = toRadians(nLng2 - nLng1)

    const radLat1 = toRadians(nLat1)
    const radLat2 = toRadians(nLat2)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(radLat1) * Math.cos(radLat2)

    const clampedA = Math.max(0, Math.min(1, a))
    const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA))

    return Math.round(EARTH_RADIUS_KM * c * 100) / 100
}

const buildNearSphereQuery = (lat, lng, maxDistanceKm = 50) => {
    if (!isValidCoordinate(lat, lng)) {
        throw new Error("Invalid latitude or longitude provided for spatial query")
    }

    const numericKm = Number(maxDistanceKm)
    if (!Number.isFinite(numericKm) || numericKm <= 0) {
        throw new Error("Invalid distance radius provided")
    }

    return {
        $nearSphere: {
            $geometry: {
                type: "Point",
                coordinates: [Number(lng), Number(lat)]
            },
            $maxDistance: numericKm * 1000
        }
    }
}

const buildGeoWithinSphereQuery = (lat, lng, radiusKm = 50) => {
    if (!isValidCoordinate(lat, lng)) {
        throw new Error("Invalid latitude or longitude provided for spatial query")
    }

    const numericKm = Number(radiusKm)
    if (!Number.isFinite(numericKm) || numericKm <= 0) {
        throw new Error("Invalid distance radius provided")
    }

    const radiusInRadians = numericKm / EARTH_RADIUS_KM

    return {
        $geoWithin: {
            $centerSphere: [[Number(lng), Number(lat)], radiusInRadians]
        }
    }
}

module.exports = {
    isValidCoordinate,
    calculateDistanceKm,
    buildNearSphereQuery,
    buildGeoWithinSphereQuery
}