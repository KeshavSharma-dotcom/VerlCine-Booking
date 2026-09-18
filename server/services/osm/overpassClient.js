const OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
]

const buildCinemaQuery = (lat, lng, radiusMeters) => {
    return `
        [out:json][timeout:25];
        (
            node["amenity"="cinema"](around:${radiusMeters},${lat},${lng});
            way["amenity"="cinema"](around:${radiusMeters},${lat},${lng});
            relation["amenity"="cinema"](around:${radiusMeters},${lat},${lng});
        );
        out center tags;
    `
}

const fetchCinemasInRadius = async (lat, lng, radiusKm = 50, timeoutMs = 25000) => {
    const radiusMeters = Math.round(radiusKm * 1000)
    const query = buildCinemaQuery(lat, lng, radiusMeters)

    let lastError = null

    for (const endpoint of OVERPASS_ENDPOINTS) {
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "CineVerl-SyncEngine/1.0"
                },
                body: `data=${encodeURIComponent(query)}`,
                signal: AbortSignal.timeout(timeoutMs)
            })

            if (!response.ok) {
                throw new Error(`Overpass endpoint error: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()

            if (data && Array.isArray(data.elements)) {
                return data.elements
            }
        } catch (err) {
            lastError = err
        }
    }

    throw new Error(lastError ? lastError.message : "All Overpass API endpoints failed to respond")
}

module.exports = {
    fetchCinemasInRadius,
    buildCinemaQuery
}