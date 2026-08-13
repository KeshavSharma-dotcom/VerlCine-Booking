import { configureStore } from "@reduxjs/toolkit"
import { baseApi } from "../core/api/baseApi.ts"
import authReducer from "../features/authentication/store/authSlice.ts"
import bookingReducer from "../features/booking/store/bookingSlice.ts"

export const store = configureStore({
    reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
        auth: authReducer,
        booking: bookingReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch