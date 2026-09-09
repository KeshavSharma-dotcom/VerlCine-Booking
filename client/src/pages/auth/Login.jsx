import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { loginUserThunk, verify2FALoginThunk } from "../../redux/thunks/authThunks"
import { clearAuthStatus, reset2FAState } from "../../redux/slices/authSlice"
import namedLogo from "../../assets/images/namedLogo.png"
import "../../assets/styles/login.css"

export const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" })
    const [otp, setOtp] = useState("")
    const [validationError, setValidationError] = useState("")

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { is2FARequired, loading, error, successMessage, isAuthenticated } = useSelector((state) => state.auth)

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/", { replace: true })
        }
    }, [isAuthenticated, navigate])

    useEffect(() => {
        return () => {
            dispatch(clearAuthStatus())
            dispatch(reset2FAState())
        }
    }, [dispatch])

    const handleLogin = (e) => {
        e.preventDefault()
        setValidationError("")
        dispatch(clearAuthStatus())

        if (!formData.email.trim() || !formData.password) {
            setValidationError("Email and password are required")
            return
        }

        dispatch(loginUserThunk(formData))
    }

    const handle2FA = (e) => {
        e.preventDefault()
        setValidationError("")
        dispatch(clearAuthStatus())

        if (!otp.trim() || otp.trim().length !== 6) {
            setValidationError("Please enter a valid 6-digit OTP")
            return
        }

        dispatch(verify2FALoginThunk({ otp: otp.trim() }))
    }

    const handleBackToLogin = () => {
        setOtp("")
        setValidationError("")
        dispatch(clearAuthStatus())
        dispatch(reset2FAState())
    }

    const displayError = validationError || error

    return (
        <div className="login-container">
            <div className="login-glow-1"></div>
            <div className="login-glow-2"></div>

            <div className="login-card">
                <Link to="/" className="login-brand-link">
                    <img src={namedLogo} alt="CineVerl Logo" className="login-brand-logo" />
                </Link>

                <h2 className="login-header">
                    {is2FARequired ? "2FA Verification" : "Welcome Back"}
                </h2>
                <p className="login-subtitle">
                    {is2FARequired
                        ? "Enter the 6-digit authentication code dispatched to your registered email."
                        : "Sign in to access your bookings and seat reservations."}
                </p>

                {displayError && <div className="login-banner-error">{displayError}</div>}
                {successMessage && <div className="login-banner-info">{successMessage}</div>}

                {!is2FARequired ? (
                    <form onSubmit={handleLogin} className="login-form" noValidate>
                        <div className="login-form-group">
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

                        <div className="login-form-group">
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
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handle2FA} className="login-form">
                        <div className="login-form-group">
                            <input
                                type="text"
                                maxLength={6}
                                required
                                autoFocus
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                className="login-otp-input"
                                placeholder="000000"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="login-btn-primary"
                        >
                            {loading ? "Verifying..." : "Verify & Log In"}
                        </button>

                        <div className="login-back-wrapper">
                            <button
                                type="button"
                                onClick={handleBackToLogin}
                                className="login-back-btn"
                            >
                                Back to Sign In
                            </button>
                        </div>
                    </form>
                )}

                <p className="login-footer-text">
                    Don't have an account?{" "}
                    <Link to="/register" className="login-link">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Login