import React from "react"
import { RegisterForm } from "./features/authentication/components/RegisterForm"
import { LoginForm } from "./features/authentication/components/LoginForm"
import { useAppSelector } from "./app/hooks"

const App: React.FC = () => {
    const { user, isAuthenticated, is2FARequired } = useAppSelector((state) => state.auth)

    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <h1>Auth Test Bench</h1>
            {isAuthenticated && user ? (
                <div>
                    <h2>Welcome, {user.name}!</h2>
                    <p>Email: {user.email}</p>
                    <p>Role: {user.role}</p>
                </div>
            ) : is2FARequired ? (
                <div>
                    <h2>2FA Verification Screen</h2>
                    <p>OTP sent to your email. Enter OTP to complete login.</p>
                </div>
            ) : (
                <div style={{ display: "flex", gap: "40px" }}>
                    <RegisterForm />
                    <LoginForm />
                </div>
            )}
        </div>
    )
}

export default App