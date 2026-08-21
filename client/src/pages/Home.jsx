import React from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logoutUser } from "../redux/thunks/authThunks.js"
import "../assets/styles/home.css"

export const Home = () => {
    const dispatch = useDispatch()
    const { user, isAuthenticated } = useSelector((state) => state.auth)

    return (
        <div className="home-container">
            <h1 className="home-title">CineVerl Movie Booking</h1>
            {isAuthenticated && user ? (
                <div className="home-auth-card">
                    <p className="home-welcome-text">
                        Welcome, <span className="home-user-name">{user.name}</span>!
                    </p>
                    <p className="home-meta-text">Email: {user.email} | Role: {user.role}</p>
                    <div className="home-action-group">
                        <Link to="/history" className="home-btn-history">
                            Booking History
                        </Link>
                        <button onClick={() => dispatch(logoutUser())} className="home-btn-logout">
                            Logout
                        </button>
                    </div>
                </div>
            ) : (
                <div className="home-guest-group">
                    <Link to="/login" className="home-btn-login">
                        Login
                    </Link>
                    <Link to="/register" className="home-btn-register">
                        Register
                    </Link>
                </div>
            )}
        </div>
    )
}