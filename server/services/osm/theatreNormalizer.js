const cleanString = (val) => {
    if (!val || typeof val !== "string") return ""
    return val.replace(/\s+/g, " ").trim()
}

const resolveCity = (rawAddress = {}, fallbackCity = "Mumbai") => {
    const candidate =
        rawAddress.city ||
        rawAddress.suburb ||
        rawAddress.state ||
        fallbackCity

    const cleaned = cleanString(candidate)
    return cleaned.length > 0 ? cleaned : fallbackCity
}

const buildAddressString = (name, rawAddress = {}, resolvedCity = "Mumbai") => {
    const parts = []

    const house = cleanString(rawAddress.housenumber)
    const street = cleanString(rawAddress.street)
    const suburb = cleanString(rawAddress.suburb)
    const postcode = cleanString(rawAddress.postcode)

    if (house && street) {
        parts.push(`${house}, ${street}`)
    } else if (street) {
        parts.push(street)
    }

    if (suburb && !parts.includes(suburb)) {
        parts.push(suburb)
    }

    if (resolvedCity && !parts.includes(resolvedCity)) {
        parts.push(resolvedCity)
    }

    if (postcode) {
        parts.push(postcode)
    }

    if (parts.length === 0) {
        return `${cleanString(name)}, ${resolvedCity}`
    }

    return parts.join(", ")
}

const estimateScreens = (tags = {}) => {
    const explicitCount =
        tags.screens ||
        tags["screen_count"] ||
        tags["theatre:screens"] ||
        tags["cinema:screens"]

    const parsedCount = parseInt(explicitCount, 10)
    const screenCount = Number.isInteger(parsedCount) && parsedCount > 0 && parsedCount <= 16
        ? parsedCount
        : 2

    const defaultSeatCapacities = [60, 50, 60, 50, 40, 40, 80, 50]

    return Array.from({ length: screenCount }, (_, idx) => ({
        screenNumber: idx + 1,
        totalSeats: defaultSeatCapacities[idx % defaultSeatCapacities.length]
    }))
}

const normalizeOsmCinema = (dto, defaultCity = "Mumbai", ownerId = null) => {
    if (!dto || typeof dto !== "object") {
        return null
    }

    const name = cleanString(dto.name)
    if (!name) {
        return null
    }

    const city = resolveCity(dto.rawAddress, defaultCity)
    const address = buildAddressString(name, dto.rawAddress, city)
    const screens = estimateScreens(dto.tags)

    return {
        name,
        city,
        address,
        location: {
            type: "Point",
            coordinates: [Number(dto.coordinates[0]), Number(dto.coordinates[1])]
        },
        osmId: dto.osmId,
        osmType: dto.osmType,
        tags: dto.tags instanceof Map ? dto.tags : new Map(Object.entries(dto.tags || {})),
        screens,
        owner: ownerId,
        isActive: true
    }
}

const normalizeOsmCinemaBatch = (dtoList = [], defaultCity = "Mumbai", ownerId = null) => {
    if (!Array.isArray(dtoList)) return []

    const normalizedTheatres = []

    for (const dto of dtoList) {
        const normalized = normalizeOsmCinema(dto, defaultCity, ownerId)
        if (normalized) {
            normalizedTheatres.push(normalized)
        }
    }

    return normalizedTheatres
}

module.exports = {
    cleanString,
    resolveCity,
    buildAddressString,
    estimateScreens,
    normalizeOsmCinema,
    normalizeOsmCinemaBatch
}