import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser, verifyAccount } from '../../redux/thunks/authThunks'
import { Link, useNavigate } from 'react-router-dom'
import "../../assets/styles/register.css"

export const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' })
    const [otp, setOtp] = useState('')
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { tempUserId, loading, error, message, isAuthenticated } = useSelector((state) => state.auth)

    if (isAuthenticated) {
        navigate('/')
    }

    const handleRegister = (e) => {
        e.preventDefault()
        dispatch(registerUser(formData))
    }

    const handleVerify = (e) => {
        e.preventDefault()
        dispatch(verifyAccount({ userId: tempUserId, otp }))
    }

    return (
        <div className="register-container">
            <div className="register-card">
                <h2 className="register-header">
                    {tempUserId ? 'Verify Your Email' : 'Create an Account'}
                </h2>

                {error && <div className="register-error-banner">{error}</div>}
                {message && <div className="register-success-banner">{message}</div>}

                {!tempUserId ? (
                    <form onSubmit={handleRegister} className="register-form">
                        <div>
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
                        <div>
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
                        <div>
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
                            {loading ? 'Sending OTP...' : 'Register'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerify} className="register-form">
                        <p className="register-label" style={{ textAlign: 'center' }}>
                            Enter the 6-digit verification code sent to your email.
                        </p>
                        <input
                            type="text"
                            maxLength={6}
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="register-otp-input"
                            placeholder="000000"
                        />
                        <button type="submit" disabled={loading || otp.length !== 6} className="register-btn-primary">
                            {loading ? 'Activating...' : 'Verify & Activate'}
                        </button>
                    </form>
                )}

                <p className="register-footer-text">
                    Already registered? <Link to="/login" className="register-link">Log in</Link>
                </p>
            </div>
        </div>
    )
}