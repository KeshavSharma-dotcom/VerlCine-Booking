const Theatre = require("../models/Theatre")
const { fetchCinemasInRadius } = require("./osm/overpassClient")
const { parseOsmCinemaList } = require("../dto/osmCinemaDto")
const { normalizeOsmCinemaBatch } = require("./osm/theatreNormalizer")
const { calculateDistanceKm } = require("../utils/geoUtils")

const syncCinemasFromOsm = async ({
    lat = 18.9690,
    lng = 72.8194,
    radiusKm = 50,
    defaultCity = "Mumbai",
    ownerId = null
} = {}) => {
    const rawElements = await fetchCinemasInRadius(lat, lng, radiusKm)
    if (!rawElements || rawElements.length === 0) {
        return {
            totalFetched: 0,
            inserted: 0,
            updated: 0,
            unmodified: 0
        }
    }

    const dtoList = parseOsmCinemaList(rawElements)
    const normalizedList = normalizeOsmCinemaBatch(dtoList, defaultCity, ownerId)

    if (normalizedList.length === 0) {
        return {
            totalFetched: rawElements.length,
            inserted: 0,
            updated: 0,
            unmodified: 0
        }
    }

    const osmIds = normalizedList.map((t) => t.osmId)
    const existingVenues = await Theatre.find({
        $or: [
            { osmId: { $in: osmIds } },
            { city: new RegExp(`^${defaultCity}$`, "i"), isActive: true }
        ]
    })

    const osmIdMap = new Map()
    const legacySpatialList = []

    for (const venue of existingVenues) {
        if (venue.osmId) {
            osmIdMap.set(venue.osmId, venue)
        } else if (venue.location?.coordinates) {
            legacySpatialList.push(venue)
        }
    }

    const bulkOperations = []
    let insertedCount = 0
    let updatedCount = 0

    for (const item of normalizedList) {
        let match = osmIdMap.get(item.osmId)

        if (!match && legacySpatialList.length > 0) {
            const [itemLng, itemLat] = item.location.coordinates
            match = legacySpatialList.find((legacy) => {
                const [lLng, lLat] = legacy.location.coordinates
                const distanceKm = calculateDistanceKm(itemLat, itemLng, lLat, lLng)
                const nameMatches = legacy.name.toLowerCase().trim() === item.name.toLowerCase().trim()
                return nameMatches && distanceKm !== null && distanceKm <= 0.15
            })
        }

        if (match) {
            bulkOperations.push({
                updateOne: {
                    filter: { _id: match._id },
                    update: {
                        $set: {
                            name: item.name,
                            address: item.address,
                            city: item.city,
                            location: item.location,
                            osmId: item.osmId,
                            osmType: item.osmType,
                            tags: Object.fromEntries(item.tags)
                        }
                    }
                }
            })
            updatedCount++
        } else {
            bulkOperations.push({
                insertOne: {
                    document: {
                        ...item,
                        tags: Object.fromEntries(item.tags)
                    }
                }
            })
            insertedCount++
        }
    }

    if (bulkOperations.length > 0) {
        await Theatre.bulkWrite(bulkOperations, { ordered: false })
    }

    return {
        totalFetched: rawElements.length,
        normalized: normalizedList.length,
        inserted: insertedCount,
        updated: updatedCount
    }
}

module.exports = {
    syncCinemasFromOsm
}