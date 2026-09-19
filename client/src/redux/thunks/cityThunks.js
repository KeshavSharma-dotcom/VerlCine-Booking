import { createAsyncThunk } from "@reduxjs/toolkit"

export const fetchAlphabets = createAsyncThunk(
    "city/fetchAlphabets",
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetch("/api/v1/locations/alphabets")
            const data = await res.json()
            if (!res.ok) return rejectWithValue(data.message || "Failed to fetch alphabets")
            return data.alphabets || []
        } catch (err) {
            return rejectWithValue(err.message || "Network error fetching alphabets")
        }
    }
)

export const fetchPopularCities = createAsyncThunk(
    "city/fetchPopularCities",
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetch("/api/v1/locations/popular-cities")
            const data = await res.json()
            if (!res.ok) return rejectWithValue(data.message || "Failed to fetch popular cities")
            return data.cities || []
        } catch (err) {
            return rejectWithValue(err.message || "Network error fetching popular cities")
        }
    }
)

export const fetchAllCities = createAsyncThunk(
    "city/fetchAllCities",
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetch("/api/v1/locations/cities")
            const data = await res.json()
            if (!res.ok) return rejectWithValue(data.message || "Failed to fetch all cities")
            return {
                grouped: data.grouped || {},
                cities: data.cities || []
            }
        } catch (err) {
            return rejectWithValue(err.message || "Network error fetching all cities")
        }
    }
)