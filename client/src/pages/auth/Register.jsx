import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import {
    registerUserThunk,
    verifyAccountThunk,
    resendOtpThunk
} from "../../redux/thunks/authThunks"
import { clearAuthStatus } from "../../redux/slices/authSlice"
import namedLogo from "../../assets/images/namedLogo.png"
import "../../assets/styles/register.css"

export const Register = () => {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" })
    const [otp, setOtp] = useState("")
    const [validationError, setValidationError] = useState("")

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { pendingUserId, loading, error, successMessage, isAuthenticated } = useSelector((state) => state.auth)

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/", { replace: true })
        }
    }, [isAuthenticated, navigate])

    useEffect(() => {
        return () => {
            dispatch(clearAuthStatus())
        }
    }, [dispatch])

    const handleRegisterSubmit = (e) => {
        e.preventDefault()
        setValidationError("")
        dispatch(clearAuthStatus())

        if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
            setValidationError("All fields are required")
            return
        }

        if (formData.password.length < 6) {
            setValidationError("Password must be at least 6 characters")
            return
        }

        dispatch(registerUserThunk(formData))
    }

    const handleVerifySubmit = (e) => {
        e.preventDefault()
        setValidationError("")
        dispatch(clearAuthStatus())

        if (!otp.trim() || otp.trim().length !== 6) {
            setValidationError("Please enter a valid 6-digit OTP")
            return
        }

        dispatch(verifyAccountThunk({ userId: pendingUserId, otp: otp.trim() }))
    }

    const handleResendOtp = () => {
        setValidationError("")
        dispatch(clearAuthStatus())
        dispatch(resendOtpThunk({ userId: pendingUserId, email: formData.email.trim().toLowerCase() }))
    }

    const displayError = validationError || error

    return (
        <div className="register-container">
            <div className="register-glow-1"></div>
            <div className="register-glow-2"></div>

            <div className="register-card">
                <Link to="/" className="register-brand-link">
                    <img src={namedLogo} alt="CineVerl Logo" className="register-brand-logo" />
                </Link>

                <h2 className="register-header">
                    {pendingUserId ? "Verify Your Email" : "Create Account"}
                </h2>
                <p className="register-subtitle">
                    {pendingUserId
                        ? "Enter the 6-digit activation code sent to your inbox."
                        : "Sign up to book tickets, reserve seats, and experience movies."}
                </p>

                {displayError && <div className="register-banner-error">{displayError}</div>}
                {successMessage && <div className="register-banner-success">{successMessage}</div>}

                {!pendingUserId ? (
                    <form onSubmit={handleRegisterSubmit} className="register-form" noValidate>
                        <div className="register-form-group">
                            <label className="register-label">Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="register-input"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="register-form-group">
                            <label className="register-label">Email Address</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="register-input"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="register-form-group">
                            <label className="register-label">Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="register-input"
                                placeholder="••••••••"
                            />
                        </div>

                        <button type="submit" disabled={loading} className="register-btn-primary">
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifySubmit} className="register-form">
                        <div className="register-form-group">
                            <input
                                type="text"
                                maxLength={6}
                                required
                                autoFocus
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                className="register-otp-input"
                                placeholder="000000"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="register-btn-primary"
                        >
                            {loading ? "Verifying..." : "Confirm & Continue"}
                        </button>

                        <div className="register-resend-wrapper">
                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleResendOtp}
                                className="register-resend-btn"
                            >
                                Resend verification code
                            </button>
                        </div>
                    </form>
                )}

                <p className="register-footer-text">
                    Already have an account?{" "}
                    <Link to="/login" className="register-link">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Register