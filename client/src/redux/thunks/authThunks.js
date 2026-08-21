import { createAsyncThunk } from '@reduxjs/toolkit'
import * as authService from '../../services/authService'

export const registerUser = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
    try { return await authService.register(payload) } catch (err) { return rejectWithValue(err.message) }
})

export const verifyAccount = createAsyncThunk('auth/verifyAccount', async (payload, { rejectWithValue }) => {
    try { return await authService.verifyAccount(payload) } catch (err) { return rejectWithValue(err.message) }
})

export const loginUser = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
    try { return await authService.login(payload) } catch (err) { return rejectWithValue(err.message) }
})

export const verify2FALogin = createAsyncThunk('auth/verify2FA', async (otp, { rejectWithValue }) => {
    try { return await authService.verify2FALogin(otp) } catch (err) { return rejectWithValue(err.message) }
})

export const checkAuthSession = createAsyncThunk('auth/session', async (_, { rejectWithValue }) => {
    try { return await authService.getCurrentUser() } catch (err) { return rejectWithValue(err.message) }
})

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try { return await authService.logout() } catch (err) { return rejectWithValue(err.message) }
})