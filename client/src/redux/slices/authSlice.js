import { createSlice } from '@reduxjs/toolkit'
import { registerUser, verifyAccount, loginUser, verify2FALogin, checkAuthSession, logoutUser } from '../thunks/authThunks.js'

const initialState = {
    user: null,
    isAuthenticated: false,
    is2FARequired: false,
    tempUserId: null,
    loading: false,
    error: null,
    message: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => { state.error = null },
        clearMessage: (state) => { state.message = null }
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false
                state.tempUserId = action.payload.userId
                state.message = action.payload.message
            })
            .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload })

            // Verify Account
            .addCase(verifyAccount.pending, (state) => { state.loading = true; state.error = null })
            .addCase(verifyAccount.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload.user
                state.isAuthenticated = true
                state.tempUserId = null
            })
            .addCase(verifyAccount.rejected, (state, action) => { state.loading = false; state.error = action.payload })

            // Login
            .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false
                if (action.payload.is2FARequired) {
                    state.is2FARequired = true
                    state.message = action.payload.message
                } else {
                    state.user = action.payload.user
                    state.isAuthenticated = true
                }
            })
            .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload })

            // 2FA Login
            .addCase(verify2FALogin.pending, (state) => { state.loading = true; state.error = null })
            .addCase(verify2FALogin.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload.user
                state.isAuthenticated = true
                state.is2FARequired = false
            })
            .addCase(verify2FALogin.rejected, (state, action) => { state.loading = false; state.error = action.payload })

            .addCase(checkAuthSession.fulfilled, (state, action) => {
                state.user = action.payload.user
                state.isAuthenticated = true
            })
            .addCase(checkAuthSession.rejected, (state) => {
                state.user = null
                state.isAuthenticated = false
            })

            // Logout
            .addCase(logoutUser.fulfilled, () => initialState)
    }
})

export const { clearError, clearMessage } = authSlice.actions
export default authSlice.reducer