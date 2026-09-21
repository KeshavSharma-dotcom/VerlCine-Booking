import { createSlice } from "@reduxjs/toolkit"
import { fetchNearbyTheatres, fetchTheatreCities } from "../thunks/theatreThunks"
import { setCitySelection } from "./citySlice"

const initialState = {
    theatres: [],
    cities: ["Mumbai"],
    selectedCity: "Mumbai",
    userLocation: {
        lat: 18.9690,
        lng: 72.8194,
        radiusKm: 50
    },
    loading: false,
    error: null
}

export const theatreSlice = createSlice({
    name: "theatre",
    initialState,
    reducers: {
        setSelectedCity: (state, action) => {
            state.selectedCity = action.payload
        },
        setUserLocation: (state, action) => {
            state.userLocation = {
                ...state.userLocation,
                ...action.payload
            }
        },
        clearTheatreError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNearbyTheatres.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchNearbyTheatres.fulfilled, (state, action) => {
                state.loading = false
                state.theatres = action.payload.theatres || []
                if (action.payload.origin) {
                    state.userLocation = {
                        lat: action.payload.origin.lat,
                        lng: action.payload.origin.lng,
                        radiusKm: action.payload.origin.radiusKm
                    }
                }
            })
            .addCase(fetchNearbyTheatres.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || "Failed to fetch nearby theatres"
            })
            .addCase(fetchTheatreCities.fulfilled, (state, action) => {
                if (Array.isArray(action.payload) && action.payload.length > 0) {
                    state.cities = action.payload
                }
            })
            .addCase(setCitySelection, (state, action) => {
                const { city, lat, lng } = action.payload
                state.selectedCity = city
                state.userLocation = {
                    lat: lat || state.userLocation.lat,
                    lng: lng || state.userLocation.lng,
                    radiusKm: 40
                }
            })
    }
})

export const { setSelectedCity, setUserLocation, clearTheatreError } = theatreSlice.actions
export default theatreSlice.reducer