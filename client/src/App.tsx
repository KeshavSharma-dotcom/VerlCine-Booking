import React, { useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { Home } from "./pages/Home"
import { MovieDetails } from "./pages/MovieDetails"
import { SeatSelection } from "./pages/SeatSelection"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { PrivacySettings } from "./features/authentication/components/PrivacySettings"
import { useGetCurrentUserQuery } from "./features/authentication/services/authApi"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { setCredentials } from "./features/authentication/store/authSlice"
import "./assets/styles/App.css"

const App: React.FC = () => {
    const dispatch = useAppDispatch()
    const { isAuthenticated } = useAppSelector((state) => state.auth)
    const { data } = useGetCurrentUserQuery()

    useEffect(() => {
        if (data?.success && data?.user) {
            dispatch(setCredentials({ user: data.user }))
        }
    }, [data, dispatch])

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:movieId" element={<MovieDetails />} />
            <Route path="/book/:showtimeId" element={<SeatSelection />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
            <Route
                path="/profile"
                element={
                    isAuthenticated ? (
                        <div className="app-profile-container">
                            <div className="app-profile-wrapper">
                                <h1 className="app-profile-title">Profile & Security</h1>
                                <PrivacySettings />
                            </div>
                        </div>
                    ) : (
                        <Navigate to="/login" />
                    )
                }
            />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    )
}

export default App