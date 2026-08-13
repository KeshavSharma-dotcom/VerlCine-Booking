import React, { useState } from "react"
import { useRegisterMutation } from "../services/authApi"
import { useAppDispatch } from "../../../app/hooks.ts"
import { setCredentials } from "../store/authSlice"

export const RegisterForm: React.FC = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [register, { isLoading, error }] = useRegisterMutation()
    const dispatch = useAppDispatch()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const result = await register({ name, email, password }).unwrap()
            if (result.success && result.user) {
                dispatch(setCredentials({ user: result.user }))
                alert("Registered successfully!")
            }
        } catch (err: any) {
            console.error(err)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>
            {error && <p style={{ color: "red" }}>{(error as any)?.data?.message || "Registration failed"}</p>}
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" disabled={isLoading}>{isLoading ? "Registering..." : "Register"}</button>
        </form>
    )
}