import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useLoginMutation } from "../features/authentication/services/authApi"
import { useAppDispatch } from "../app/hooks"
import { setCredentials, set2FARequired } from "../features/authentication/store/authSlice"
import "../assets/styles/auth.css"

export const Login: React.FC = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [login, { isLoading, error }] = useLoginMutation()
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const result = await login({ email, password }).unwrap()
            if (result.is2FARequired) {
                dispatch(set2FARequired())
                navigate("/verify-2fa")
            } else if (result.success && result.user) {
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
                <h2 className="auth-title">Welcome Back</h2>
                {error && (
                    <div className="auth-error-banner">
                        {(error as any)?.data?.message || "Invalid credentials"}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="auth-form">
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
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="auth-btn-primary">
                        {isLoading ? "Signing In..." : "Sign In"}
                    </button>
                </form>
                <p className="auth-footer-text">
                    Don't have an account?{" "}
                    <Link to="/register" className="auth-link">Create one</Link>
                </p>
            </div>
        </div>
    )
}