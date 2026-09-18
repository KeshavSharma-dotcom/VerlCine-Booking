import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import movieReducer from "./slices/movieSlice"
import theatreReducer from "./slices/theatreSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        movie : movieReducer,
        theatre : theatreReducer
    }
})

export default store