const LOCATION_STORAGE_KEY = "cineverl_user_location"

export const DEFAULT_APP_LOCATION = {
    city: "Delhi NCR",
    lat: 28.6139,
    lng: 77.2090,
    radiusKm: 40
}

export const saveLocationSession = (locationData) => {
    try {
        const payload = {
            city: locationData.city || DEFAULT_APP_LOCATION.city,
            lat: locationData.lat ?? DEFAULT_APP_LOCATION.lat,
            lng: locationData.lng ?? DEFAULT_APP_LOCATION.lng,
            radiusKm: 40,
            updatedAt: Date.now()
        }
        sessionStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(payload))
    } catch { }
}

export const getLocationSession = () => {
    try {
        const raw = sessionStorage.getItem(LOCATION_STORAGE_KEY)
        if (!raw) return DEFAULT_APP_LOCATION
        const parsed = JSON.parse(raw)
        return {
            city: parsed.city || DEFAULT_APP_LOCATION.city,
            lat: Number(parsed.lat) || DEFAULT_APP_LOCATION.lat,
            lng: Number(parsed.lng) || DEFAULT_APP_LOCATION.lng,
            radiusKm: 40
        }
    } catch {
        return DEFAULT_APP_LOCATION
    }
}