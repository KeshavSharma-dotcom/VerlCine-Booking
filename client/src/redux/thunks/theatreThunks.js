import { createAsyncThunk } from "@reduxjs/toolkit"

export const fetchNearbyTheatres = createAsyncThunk(
    "theatres/fetchNearby",
    async ({ lat = 18.9690, lng = 72.8194, radius = 50, city = "" } = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams({
                lat: String(lat),
                lng: String(lng),
                radius: String(radius)
            })

            if (city && city.trim().length > 0) {
                queryParams.append("city", city.trim())
            }

            const response = await fetch(`/api/v1/theatres/nearby?${queryParams.toString()}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            })

            const data = await response.json()

            if (!response.ok) {
                return rejectWithValue(data.message || "Failed to fetch nearby cinemas")
            }

            return data
        } catch (err) {
            return rejectWithValue(err.message || "Network error fetching nearby theatres")
        }
    }
)

export const fetchTheatreCities = createAsyncThunk(
    "theatres/fetchCities",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch("/api/v1/theatres/cities", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            })

            const data = await response.json()

            if (!response.ok) {
                return rejectWithValue(data.message || "Failed to fetch operational cities")
            }

            return data.cities || []
        } catch (err) {
            return rejectWithValue(err.message || "Network error fetching cities")
        }
    }
)