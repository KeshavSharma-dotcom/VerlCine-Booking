import { fetchClient } from './apiClient'

export const register = (body) => fetchClient('/auth/register', { method: 'POST', body: JSON.stringify(body) })
export const verifyAccount = (body) => fetchClient('/auth/verify-account', { method: 'POST', body: JSON.stringify(body) })
export const login = (body) => fetchClient('/auth/login', { method: 'POST', body: JSON.stringify(body) })
export const verify2FALogin = (otp) => fetchClient('/auth/verify-2fa-login', { method: 'POST', body: JSON.stringify({ otp }) })
export const getCurrentUser = () => fetchClient('/auth/me', { method: 'GET' })
export const logout = () => fetchClient('/auth/logout', { method: 'POST' })