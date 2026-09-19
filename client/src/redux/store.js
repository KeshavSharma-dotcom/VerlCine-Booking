import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import movieReducer from "./slices/movieSlice"
import theatreReducer from "./slices/theatreSlice"
import cityReducer from "./slices/citySlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        movie : movieReducer,
        theatre : theatreReducer,
        city : cityReducer
    }
})

export default store