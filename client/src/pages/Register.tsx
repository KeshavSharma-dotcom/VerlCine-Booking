import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useRegisterMutation } from "../features/authentication/services/authApi"
import { useAppDispatch } from "../app/hooks"
import { setCredentials } from "../features/authentication/store/authSlice"
import "../assets/styles/auth.css"

export const Register: React.FC = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [register, { isLoading, error }] = useRegisterMutation()
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const result = await register({ name, email, password }).unwrap()
            if (result.success && result.user) {
                dispatch(setCredentials({ user: result.user }))
                navigate("/")
            }
        } catch (err: any) {
            console.error(err)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Create Account</h2>
                {error && (
                    <div className="auth-error-banner">
                        {(error as any)?.data?.message || "Registration failed"}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div>
                        <label className="auth-label">Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>
                    <div>
                        <label className="auth-label">Email Address</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>
                    <div>
                        <label className="auth-label">Password</label>
                        <input
                            type="password"
                            placeholder="Minimum 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="auth-btn-primary">
                        {isLoading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>
                <p className="auth-footer-text">
                    Already have an account?{" "}
                    <Link to="/login" className="auth-link">Log In</Link>
                </p>
            </div>
        </div>
    )
}