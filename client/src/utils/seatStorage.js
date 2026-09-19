const PREFIX = "cineverl_booking"

export const saveSelectedSeats = (showtimeId, seats, totalPrice = 0) => {
    try {
        const payload = {
            seats,
            totalPrice,
            timestamp: Date.now()
        }
        sessionStorage.setItem(`${PREFIX}_${showtimeId}`, JSON.stringify(payload))
    } catch {
        // Fallback for private browsing or disabled storage
    }
}

export const getSavedSeats = (showtimeId) => {
    try {
        const raw = sessionStorage.getItem(`${PREFIX}_${showtimeId}`)
        if (!raw) return { seats: [], totalPrice: 0 }
        const parsed = JSON.parse(raw)
        return {
            seats: parsed.seats || [],
            totalPrice: parsed.totalPrice || 0
        }
    } catch {
        return { seats: [], totalPrice: 0 }
    }
}

export const clearSavedSeats = (showtimeId) => {
    try {
        sessionStorage.removeItem(`${PREFIX}_${showtimeId}`)
    } catch {
        // Safe fail
    }
}