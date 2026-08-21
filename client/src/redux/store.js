import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
// import bookingReducer from './slices/bookingSlice'
// import movieReducer from './slices/movieSlice'
// import theatreReducer from './slices/theatreSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        // booking: bookingReducer,
        // movies: movieReducer,
        // theatres: theatreReducer
    },
    devTools: process.env.NODE_ENV !== 'production'
})