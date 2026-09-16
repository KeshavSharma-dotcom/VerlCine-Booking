import { createSlice } from "@reduxjs/toolkit"
import {
    fetchMovies,
    fetchMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
    addShowtime,
    removeShowtime,
    fetchShowtimeDetails,
    createBooking
} from "../thunks/movieThunks"

const initialState = {
    movies: [],
    selectedMovie: null,
    currentShowtime: null,
    activeBooking: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    },
    filter: {
        genre: "",
        theatreId: "",
        searchQuery: "",
        city: "Jaipur"
    },
    loading: false,
    actionLoading: false,
    showtimeLoading: false,
    bookingLoading: false,
    error: null,
    bookingError: null,
    successMessage: null
}

const movieSlice = createSlice({
    name: "movie",
    initialState,
    reducers: {
        setFilter: (state, action) => {
            state.filter = { ...state.filter, ...action.payload }
        },
        clearFilter: (state) => {
            state.filter = {
                genre: "",
                theatreId: "",
                searchQuery: "",
                city: "Jaipur"
            }
        },
        clearSelectedMovie: (state) => {
            state.selectedMovie = null
            state.error = null
        },
        clearCurrentShowtime: (state) => {
            state.currentShowtime = null
        },
        clearBookingState: (state) => {
            state.activeBooking = null
            state.bookingError = null
        },
        clearMovieMessages: (state) => {
            state.error = null
            state.successMessage = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMovies.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchMovies.fulfilled, (state, action) => {
                state.loading = false
                state.movies = action.payload.movies || (Array.isArray(action.payload) ? action.payload : [])
                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination
                }
            })
            .addCase(fetchMovies.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(fetchMovieById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchMovieById.fulfilled, (state, action) => {
                state.loading = false
                state.selectedMovie = action.payload
            })
            .addCase(fetchMovieById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(createMovie.pending, (state) => {
                state.actionLoading = true
                state.error = null
            })
            .addCase(createMovie.fulfilled, (state, action) => {
                state.actionLoading = false
                state.movies.unshift(action.payload)
                state.successMessage = "Movie created successfully"
            })
            .addCase(createMovie.rejected, (state, action) => {
                state.actionLoading = false
                state.error = action.payload
            })
            .addCase(updateMovie.pending, (state) => {
                state.actionLoading = true
                state.error = null
            })
            .addCase(updateMovie.fulfilled, (state, action) => {
                state.actionLoading = false
                const index = state.movies.findIndex(m => m._id === action.payload._id)
                if (index !== -1) {
                    state.movies[index] = action.payload
                }
                if (state.selectedMovie?._id === action.payload._id) {
                    state.selectedMovie = { ...state.selectedMovie, ...action.payload }
                }
                state.successMessage = "Movie updated successfully"
            })
            .addCase(updateMovie.rejected, (state, action) => {
                state.actionLoading = false
                state.error = action.payload
            })
            .addCase(deleteMovie.pending, (state) => {
                state.actionLoading = true
                state.error = null
            })
            .addCase(deleteMovie.fulfilled, (state, action) => {
                state.actionLoading = false
                state.movies = state.movies.filter(m => m._id !== action.payload)
                if (state.selectedMovie?._id === action.payload) {
                    state.selectedMovie = null
                }
                state.successMessage = "Movie deleted successfully"
            })
            .addCase(deleteMovie.rejected, (state, action) => {
                state.actionLoading = false
                state.error = action.payload
            })
            .addCase(addShowtime.pending, (state) => {
                state.actionLoading = true
                state.error = null
            })
            .addCase(addShowtime.fulfilled, (state, action) => {
                state.actionLoading = false
                if (state.selectedMovie) {
                    if (!state.selectedMovie.showtimes) {
                        state.selectedMovie.showtimes = []
                    }
                    state.selectedMovie.showtimes.push(action.payload)
                }
                state.successMessage = "Showtime scheduled successfully"
            })
            .addCase(addShowtime.rejected, (state, action) => {
                state.actionLoading = false
                state.error = action.payload
            })
            .addCase(removeShowtime.pending, (state) => {
                state.actionLoading = true
                state.error = null
            })
            .addCase(removeShowtime.fulfilled, (state, action) => {
                state.actionLoading = false
                if (state.selectedMovie?.showtimes) {
                    state.selectedMovie.showtimes = state.selectedMovie.showtimes.filter(
                        st => st._id !== action.payload
                    )
                }
                state.successMessage = "Showtime cancelled successfully"
            })
            .addCase(removeShowtime.rejected, (state, action) => {
                state.actionLoading = false
                state.error = action.payload
            })
            .addCase(fetchShowtimeDetails.pending, (state) => {
                state.showtimeLoading = true
                state.error = null
            })
            .addCase(fetchShowtimeDetails.fulfilled, (state, action) => {
                state.showtimeLoading = false
                state.currentShowtime = action.payload
            })
            .addCase(fetchShowtimeDetails.rejected, (state, action) => {
                state.showtimeLoading = false
                state.error = action.payload
            })
            .addCase(createBooking.pending, (state) => {
                state.bookingLoading = true
                state.bookingError = null
            })
            .addCase(createBooking.fulfilled, (state, action) => {
                state.bookingLoading = false
                state.activeBooking = action.payload
                state.successMessage = "Booking created successfully"
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.bookingLoading = false
                state.bookingError = action.payload
            })
    }
})

export const {
    setFilter,
    clearFilter,
    clearSelectedMovie,
    clearCurrentShowtime,
    clearBookingState,
    clearMovieMessages
} = movieSlice.actions

export default movieSlice.reducer