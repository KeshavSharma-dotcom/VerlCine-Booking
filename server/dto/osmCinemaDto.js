const { isValidCoordinate } = require("../utils/geoUtils")

const extractCoordinates = (rawElement) => {
    if (!rawElement || typeof rawElement !== "object") {
        return null
    }

    if (rawElement.type === "node") {
        const lat = rawElement.lat
        const lon = rawElement.lon !== undefined ? rawElement.lon : rawElement.lng
        if (isValidCoordinate(lat, lon)) {
            return [Number(lon), Number(lat)]
        }
    }

    if ((rawElement.type === "way" || rawElement.type === "relation") && rawElement.center) {
        const lat = rawElement.center.lat
        const lon = rawElement.center.lon !== undefined ? rawElement.center.lon : rawElement.center.lng
        if (isValidCoordinate(lat, lon)) {
            return [Number(lon), Number(lat)]
        }
    }

    return null
}

const extractName = (tags = {}) => {
    const candidate =
        tags.name ||
        tags["name:en"] ||
        tags["brand"] ||
        tags["operator"] ||
        tags["official_name"] ||
        null

    return candidate && typeof candidate === "string" ? candidate.trim() : null
}

const createOsmCinemaDto = (rawElement) => {
    if (!rawElement || typeof rawElement !== "object") {
        return null
    }

    if (!rawElement.id || !rawElement.type) {
        return null
    }

    const tags = rawElement.tags && typeof rawElement.tags === "object" ? rawElement.tags : {}

    if (tags.amenity !== "cinema") {
        return null
    }

    const coordinates = extractCoordinates(rawElement)
    if (!coordinates) {
        return null
    }

    const name = extractName(tags)
    if (!name) {
        return null
    }

    return Object.freeze({
        osmId: String(rawElement.id).trim(),
        osmType: String(rawElement.type).toLowerCase().trim(),
        name,
        coordinates,
        tags: { ...tags },
        rawAddress: {
            street: tags["addr:street"] || "",
            housenumber: tags["addr:housenumber"] || "",
            suburb: tags["addr:suburb"] || tags["addr:neighbourhood"] || "",
            city: tags["addr:city"] || tags["addr:state_district"] || "",
            state: tags["addr:state"] || "",
            postcode: tags["addr:postcode"] || ""
        }
    })
}

const parseOsmCinemaList = (rawElements = []) => {
    if (!Array.isArray(rawElements)) {
        return []
    }

    const dtoList = []
    const seenOsmIds = new Set()

    for (const raw of rawElements) {
        const dto = createOsmCinemaDto(raw)
        if (dto && !seenOsmIds.has(dto.osmId)) {
            seenOsmIds.add(dto.osmId)
            dtoList.push(dto)
        }
    }

    return dtoList
}

module.exports = {
    extractCoordinates,
    extractName,
    createOsmCinemaDto,
    parseOsmCinemaList
}