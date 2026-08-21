import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, verify2FALogin } from '../../redux/thunks/authThunks'
import { Link, useNavigate } from 'react-router-dom'
import "../../assets/styles/login.css"
export const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [otp, setOtp] = useState('')
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { is2FARequired, loading, error, message, isAuthenticated } = useSelector((state) => state.auth)

    if (isAuthenticated) {
        navigate('/')
    }

    const handleLogin = (e) => {
        e.preventDefault()
        dispatch(loginUser(formData))
    }

    const handle2FA = (e) => {
        e.preventDefault()
        dispatch(verify2FALogin(otp))
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-header">
                    {is2FARequired ? '2FA Verification' : 'Welcome Back'}
                </h2>

                {error && <div className="login-error-banner">{error}</div>}
                {message && <div className="login-info-banner">{message}</div>}

                {!is2FARequired ? (
                    <form onSubmit={handleLogin} className="login-form">
                        <div>
                            <label className="login-label">Email Address</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="login-input"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <label className="login-label">Password</label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="login-input"
                                placeholder="••••••••"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="login-btn-primary">
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handle2FA} className="login-form">
                        <p className="login-label" style={{ textAlign: 'center' }}>
                            Enter the 6-digit 2FA code sent to your registered destination.
                        </p>
                        <input
                            type="text"
                            maxLength={6}
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="login-otp-input"
                            placeholder="000000"
                        />
                        <button type="submit" disabled={loading || otp.length !== 6} className="login-btn-primary">
                            {loading ? 'Verifying...' : 'Verify & Log In'}
                        </button>
                    </form>
                )}

                <p className="login-footer-text">
                    Don't have an account? <Link to="/register" className="login-link">Register</Link>
                </p>
            </div>
        </div>
    )
}