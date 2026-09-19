import { createSlice } from "@reduxjs/toolkit"
import { fetchAlphabets, fetchPopularCities, fetchAllCities } from "../thunks/cityThunks"
import { getLocationSession, saveLocationSession, DEFAULT_APP_LOCATION } from "../../utils/locationStorage"

const initialSaved = getLocationSession()

const initialState = {
    selectedCity: initialSaved.city || DEFAULT_APP_LOCATION.city,
    userLocation: {
        lat: initialSaved.lat || DEFAULT_APP_LOCATION.lat,
        lng: initialSaved.lng || DEFAULT_APP_LOCATION.lng,
        radiusKm: initialSaved.radiusKm || DEFAULT_APP_LOCATION.radiusKm
    },
    alphabets: [],
    popularCities: [],
    groupedCities: {},
    allCities: [],
    loading: false,
    error: null
}

const citySlice = createSlice({
    name: "city",
    initialState,
    reducers: {
        setCitySelection: (state, action) => {
            const { city, lat, lng } = action.payload
            state.selectedCity = city
            state.userLocation = {
                lat: lat || DEFAULT_APP_LOCATION.lat,
                lng: lng || DEFAULT_APP_LOCATION.lng,
                radiusKm: 40
            }
            saveLocationSession({
                city,
                lat: state.userLocation.lat,
                lng: state.userLocation.lng
            })
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAlphabets.fulfilled, (state, action) => {
                state.alphabets = action.payload
            })
            .addCase(fetchPopularCities.fulfilled, (state, action) => {
                state.popularCities = action.payload
            })
            .addCase(fetchAllCities.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAllCities.fulfilled, (state, action) => {
                state.loading = false
                state.groupedCities = action.payload.grouped
                state.allCities = action.payload.cities
            })
            .addCase(fetchAllCities.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    }
})

export const { setCitySelection } = citySlice.actions
export default citySlice.reducer