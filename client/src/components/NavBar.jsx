import React from "react"
import { Link } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { logoutUserThunk } from "../redux/thunks/authThunks"
import namedLogo from "../assets/images/namedLogo.png"

export const Navbar = ({ activeTab, setActiveTab }) => {
    const dispatch = useDispatch()
    const { isAuthenticated, user } = useSelector((state) => state.auth)

    const handleLogout = () => {
        dispatch(logoutUserThunk())
    }

    return (
        <header className="home-navbar">
            <div className="home-nav-left">
                <Link to="/" className="home-brand-logo-container">
                    <img src={namedLogo} alt="CineVerl Logo" className="home-brand-logo-img" />
                </Link>
                {setActiveTab && (
                    <nav className="home-nav-links">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`home-nav-link ${activeTab === "all" ? "active" : ""}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveTab("movies")}
                            className={`home-nav-link ${activeTab === "movies" ? "active" : ""}`}
                        >
                            Movies
                        </button>
                        <button
                            onClick={() => setActiveTab("shows")}
                            className={`home-nav-link ${activeTab === "shows" ? "active" : ""}`}
                        >
                            Live Shows
                        </button>
                    </nav>
                )}
            </div>

            <div className="home-nav-actions">
                {isAuthenticated ? (
                    <div className="home-nav-user-group">
                        <span className="home-nav-username">Hi, {user?.name?.split(" ")[0]}</span>
                        {(user?.role === "admin" || user?.role === "theatre-admin") && (
                            <Link to="/admin/dashboard" className="home-nav-dashboard-link">
                                Dashboard
                            </Link>
                        )}
                        <button onClick={handleLogout} className="home-nav-logout-btn">
                            Logout
                        </button>
                    </div>
                ) : (
                    <>
                        <Link to="/login" className="home-nav-login">
                            Login
                        </Link>
                        <Link to="/register" className="home-nav-register">
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </header>
    )
}

export default Navbar