import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { registerUser, verifyAccount } from "../../redux/thunks/authThunks"
import namedLogo from "../../assets/images/namedLogo.png"
import "../../assets/styles/register.css"

export const Register = () => {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" })
    const [otp, setOtp] = useState("")
    const [validationError, setValidationError] = useState("")

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { tempUserId, loading, error, message, isAuthenticated } = useSelector((state) => state.auth)

    if (isAuthenticated) {
        navigate("/")
    }

    const handleRegisterSubmit = async (e) => {
        e.preventDefault()
        setValidationError("")

        if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
            setValidationError("All fields are required")
            return
        }

        if (formData.password.length < 6) {
            setValidationError("Password must be at least 6 characters")
            return
        }

        dispatch(registerUser(formData))
    }

    const handleVerifySubmit = async (e) => {
        e.preventDefault()
        setValidationError("")

        if (!otp.trim() || otp.trim().length !== 6) {
            setValidationError("Please enter a valid 6-digit OTP")
            return
        }

        dispatch(verifyAccount({ userId: tempUserId, otp: otp.trim() }))
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
                    {tempUserId ? "Verify Your Email" : "Create Account"}
                </h2>
                <p className="register-subtitle">
                    {tempUserId
                        ? "Enter the 6-digit activation code sent to your inbox."
                        : "Sign up to book tickets, reserve seats, and experience movies."}
                </p>

                {displayError && <div className="register-banner-error">{displayError}</div>}
                {message && <div className="register-banner-success">{message}</div>}

                {!tempUserId ? (
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