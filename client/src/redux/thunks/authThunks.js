import { createAsyncThunk } from "@reduxjs/toolkit"
import * as authService from "../../services/authService"

export const registerUserThunk = createAsyncThunk(
    "auth/registerUser",
    async (userData, { rejectWithValue }) => {
        try {
            return await authService.registerApi(userData)
        } catch (err) {
            return rejectWithValue(err.message)
        }
    }
)

export const verifyAccountThunk = createAsyncThunk(
    "auth/verifyAccount",
    async (verificationData, { rejectWithValue }) => {
        try {
            return await authService.verifyAccountApi(verificationData)
        } catch (err) {
            return rejectWithValue(err.message)
        }
    }
)

export const resendOtpThunk = createAsyncThunk(
    "auth/resendOtp",
    async (payload, { rejectWithValue }) => {
        try {
            return await authService.resendOtpApi(payload)
        } catch (err) {
            return rejectWithValue(err.message)
        }
    }
)

export const loginUserThunk = createAsyncThunk(
    "auth/loginUser",
    async (credentials, { rejectWithValue }) => {
        try {
            return await authService.loginApi(credentials)
        } catch (err) {
            return rejectWithValue(err.message)
        }
    }
)

export const verify2FALoginThunk = createAsyncThunk(
    "auth/verify2FALogin",
    async (otpData, { rejectWithValue }) => {
        try {
            return await authService.verify2FALoginApi(otpData)
        } catch (err) {
            return rejectWithValue(err.message)
        }
    }
)

export const request2FAActivationThunk = createAsyncThunk(
    "auth/request2FAActivation",
    async (passwordData, { rejectWithValue }) => {
        try {
            return await authService.request2FAActivationApi(passwordData)
        } catch (err) {
            return rejectWithValue(err.message)
        }
    }
)

export const confirm2FAActivationThunk = createAsyncThunk(
    "auth/confirm2FAActivation",
    async (otpData, { rejectWithValue }) => {
        try {
            return await authService.confirm2FAActivationApi(otpData)
        } catch (err) {
            return rejectWithValue(err.message)
        }
    }
)

export const disable2FAThunk = createAsyncThunk(
    "auth/disable2FA",
    async (passwordData, { rejectWithValue }) => {
        try {
            return await authService.disable2FAApi(passwordData)
        } catch (err) {
            return rejectWithValue(err.message)
        }
    }
)

export const checkAuthThunk = createAsyncThunk(
    "auth/checkAuth",
    async (_, { rejectWithValue }) => {
        try {
            const data = await authService.getCurrentUserApi()
            return data.user
        } catch (err) {
            return rejectWithValue(err.message)
        }
    }
)

export const logoutUserThunk = createAsyncThunk(
    "auth/logoutUser",
    async (_, { rejectWithValue }) => {
        try {
            return await authService.logoutApi()
        } catch (err) {
            return rejectWithValue(err.message)
        }
    }
)