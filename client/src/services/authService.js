import apiClient from "./apiClient"

export const registerApi = (userData) => {
    return apiClient("/auth/register", {
        method: "POST",
        body: userData
    })
}

export const verifyAccountApi = (verificationData) => {
    return apiClient("/auth/verify-account", {
        method: "POST",
        body: verificationData
    })
}

export const resendOtpApi = (payload) => {
    return apiClient("/auth/resend-otp", {
        method: "POST",
        body: payload
    })
}

export const loginApi = (credentials) => {
    return apiClient("/auth/login", {
        method: "POST",
        body: credentials
    })
}

export const verify2FALoginApi = (otpData) => {
    return apiClient("/auth/verify-2fa-login", {
        method: "POST",
        body: otpData
    })
}

export const request2FAActivationApi = (passwordData) => {
    return apiClient("/auth/2fa/enable-request", {
        method: "POST",
        body: passwordData
    })
}

export const confirm2FAActivationApi = (otpData) => {
    return apiClient("/auth/2fa/enable-confirm", {
        method: "POST",
        body: otpData
    })
}

export const disable2FAApi = (passwordData) => {
    return apiClient("/auth/2fa/disable", {
        method: "POST",
        body: passwordData
    })
}

export const getCurrentUserApi = () => {
    return apiClient("/auth/me", {
        method: "GET"
    })
}

export const logoutApi = () => {
    return apiClient("/auth/logout", {
        method: "POST"
    })
}