import { createAsyncThunk } from "@reduxjs/toolkit"

const BASE_URL = "/api/movies"

export const fetchMovies = createAsyncThunk(
    "movies/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams()
            if (params.page) queryParams.append("page", params.page)
            if (params.limit) queryParams.append("limit", params.limit)
            if (params.genre) queryParams.append("genre", params.genre)
            if (params.theatreId) queryParams.append("theatreId", params.theatreId)
            if (params.active !== undefined) queryParams.append("active", params.active)

            const response = await fetch(`${BASE_URL}?${queryParams.toString()}`, {
                method: "GET",
                credentials: "include"
            })

            const data = await response.json()

            if (!response.ok) {
                return rejectWithValue(data.message || "Failed to fetch movies")
            }

            return data
        } catch (error) {
            return rejectWithValue(error.message || "Network error")
        }
    }
)

export const fetchMovieById = createAsyncThunk(
    "movies/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/${id}`, {
                method: "GET",
                credentials: "include"
            })

            const data = await response.json()

            if (!response.ok) {
                return rejectWithValue(data.message || "Failed to fetch movie details")
            }

            return data.movie
        } catch (error) {
            return rejectWithValue(error.message || "Network error")
        }
    }
)

export const createMovie = createAsyncThunk(
    "movies/create",
    async (movieData, { rejectWithValue }) => {
        try {
            const response = await fetch(BASE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(movieData)
            })

            const data = await response.json()

            if (!response.ok) {
                return rejectWithValue(data.message || "Failed to create movie")
            }

            return data.movie
        } catch (error) {
            return rejectWithValue(error.message || "Network error")
        }
    }
)

export const updateMovie = createAsyncThunk(
    "movies/update",
    async ({ id, movieData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(movieData)
            })

            const data = await response.json()

            if (!response.ok) {
                return rejectWithValue(data.message || "Failed to update movie")
            }

            return data.movie
        } catch (error) {
            return rejectWithValue(error.message || "Network error")
        }
    }
)

export const deleteMovie = createAsyncThunk(
    "movies/delete",
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/${id}`, {
                method: "DELETE",
                credentials: "include"
            })

            const data = await response.json()

            if (!response.ok) {
                return rejectWithValue(data.message || "Failed to delete movie")
            }

            return id
        } catch (error) {
            return rejectWithValue(error.message || "Network error")
        }
    }
)

export const addShowtime = createAsyncThunk(
    "movies/addShowtime",
    async ({ movieId, showtimeData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/${movieId}/showtimes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(showtimeData)
            })

            const data = await response.json()

            if (!response.ok) {
                return rejectWithValue(data.message || "Failed to add showtime")
            }

            return data.showtime
        } catch (error) {
            return rejectWithValue(error.message || "Network error")
        }
    }
)

export const removeShowtime = createAsyncThunk(
    "movies/removeShowtime",
    async ({ movieId, showtimeId }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/${movieId}/showtimes/${showtimeId}`, {
                method: "DELETE",
                credentials: "include"
            })

            const data = await response.json()

            if (!response.ok) {
                return rejectWithValue(data.message || "Failed to delete showtime")
            }

            return showtimeId
        } catch (error) {
            return rejectWithValue(error.message || "Network error")
        }
    }
)