import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { type IUser } from "../../../core/types.ts"

interface AuthState {
    user: IUser | null
    isAuthenticated: boolean
    is2FARequired: boolean
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    is2FARequired: false
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: IUser }>) => {
            state.user = action.payload.user
            state.isAuthenticated = true
            state.is2FARequired = false
        },
        set2FARequired: (state) => {
            state.user = null
            state.isAuthenticated = false
            state.is2FARequired = true
        },
        logoutState: (state) => {
            state.user = null
            state.isAuthenticated = false
            state.is2FARequired = false
        }
    }
})

export const { setCredentials, set2FARequired, logoutState } = authSlice.actions
export default authSlice.reducer