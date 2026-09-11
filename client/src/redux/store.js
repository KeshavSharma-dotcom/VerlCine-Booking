import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import movieReducer from "./slices/movieSlice"
export const store = configureStore({
    reducer: {
        auth: authReducer,
        movie : movieReducer
    }
})

export default store