import { createSlice } from "@reduxjs/toolkit"
import {
    registerUserThunk,
    verifyAccountThunk,
    resendOtpThunk,
    loginUserThunk,
    verify2FALoginThunk,
    confirm2FAActivationThunk,
    disable2FAThunk,
    checkAuthThunk,
    logoutUserThunk
} from "../thunks/authThunks"

const initialState = {
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    is2FARequired: false,
    pendingUserId: null,
    loading: false,
    error: null,
    successMessage: null
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearAuthStatus: (state) => {
            state.error = null
            state.successMessage = null
        },
        reset2FAState: (state) => {
            state.is2FARequired = false
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUserThunk.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(registerUserThunk.fulfilled, (state, action) => {
                state.loading = false
                state.pendingUserId = action.payload.userId
                state.successMessage = action.payload.message
            })
            .addCase(registerUserThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            .addCase(verifyAccountThunk.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(verifyAccountThunk.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload.user
                state.isAuthenticated = true
                state.pendingUserId = null
                state.successMessage = action.payload.message
            })
            .addCase(verifyAccountThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            .addCase(resendOtpThunk.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(resendOtpThunk.fulfilled, (state, action) => {
                state.loading = false
                state.successMessage = action.payload.message
            })
            .addCase(resendOtpThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            .addCase(loginUserThunk.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(loginUserThunk.fulfilled, (state, action) => {
                state.loading = false
                if (action.payload.is2FARequired) {
                    state.is2FARequired = true
                    state.isAuthenticated = false
                    state.successMessage = action.payload.message
                } else {
                    state.user = action.payload.user
                    state.isAuthenticated = true
                    state.is2FARequired = false
                }
            })
            .addCase(loginUserThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            .addCase(verify2FALoginThunk.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(verify2FALoginThunk.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload.user
                state.isAuthenticated = true
                state.is2FARequired = false
                state.successMessage = action.payload.message
            })
            .addCase(verify2FALoginThunk.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            .addCase(confirm2FAActivationThunk.fulfilled, (state) => {
                if (state.user) {
                    state.user.isTwoFactorEnabled = true
                }
            })

            .addCase(disable2FAThunk.fulfilled, (state) => {
                if (state.user) {
                    state.user.isTwoFactorEnabled = false
                }
            })

            .addCase(checkAuthThunk.pending, (state) => {
                state.loading = true
            })
            .addCase(checkAuthThunk.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload
                state.isAuthenticated = true
                state.isInitialized = true
            })
            .addCase(checkAuthThunk.rejected, (state) => {
                state.loading = false
                state.user = null
                state.isAuthenticated = false
                state.isInitialized = true
            })

            .addCase(logoutUserThunk.fulfilled, (state) => {
                state.user = null
                state.isAuthenticated = false
                state.is2FARequired = false
                state.pendingUserId = null
                state.error = null
            })
    }
})

export const { clearAuthStatus, reset2FAState } = authSlice.actions
export default authSlice.reducer