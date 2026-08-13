import React, { useState } from "react"
import { useLoginMutation } from "../services/authApi"
import { useAppDispatch } from "../../../app/hooks.ts"
import { setCredentials, set2FARequired } from "../store/authSlice"

export const LoginForm: React.FC = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [login, { isLoading, error }] = useLoginMutation()
    const dispatch = useAppDispatch()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const result = await login({ email, password }).unwrap()
            if (result.is2FARequired) {
                dispatch(set2FARequired())
                alert("2FA Required! Check your email for OTP.")
            } else if (result.success && result.user) {
                dispatch(setCredentials({ user: result.user }))
                alert("Logged in successfully!")
            }
        } catch (err: any) {
            console.error(err)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            {error && <p style={{ color: "red" }}>{(error as any)?.data?.message || "Login failed"}</p>}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" disabled={isLoading}>{isLoading ? "Logging in..." : "Login"}</button>
        </form>
    )
}