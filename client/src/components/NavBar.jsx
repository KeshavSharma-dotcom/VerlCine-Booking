import React from "react"
import { Link } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { logoutUserThunk } from "../redux/thunks/authThunks"
import namedLogo from "../assets/images/namedLogo.png"
import "../assets/styles/verticalDialer.css"

export const Navbar = ({ activeTab, setActiveTab }) => {
    const dispatch = useDispatch()
    const { isAuthenticated, user } = useSelector((state) => state.auth)

    const handleLogout = () => {
        dispatch(logoutUserThunk())
    }

    const navItems = [
        { id: "all", label: "Home" },
        { id: "movies", label: "Movies" },
        { id: "shows", label: "Shows" }
    ]

    const handleWheelScroll = (e) => {
        if (!setActiveTab) return
        const keys = ["all", "movies", "shows"]
        const currentIndex = keys.indexOf(activeTab)
        if (e.deltaY > 0) {
            const nextIndex = (currentIndex + 1) % keys.length
            setActiveTab(keys[nextIndex])
        } else if (e.deltaY < 0) {
            const prevIndex = (currentIndex - 1 + keys.length) % keys.length
            setActiveTab(keys[prevIndex])
        }
    }

    return (
        <>
            <aside className="vertical-navbar-container">
                <Link to="/" className="vertical-brand-logo-container">
                    <img
                        src={namedLogo}
                        alt="CineVerl Logo"
                        className="vertical-brand-logo-img"
                    />
                </Link>

                {setActiveTab && (
                    <div className="vertical-dialer-wrap" onWheel={handleWheelScroll}>
                        <div className="vertical-dialer-track">
                            <div className="vertical-dialer-set">
                                {navItems.map((item) => (
                                    <button
                                        key={`set1-${item.id}`}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`vertical-dialer-btn ${activeTab === item.id ? "active" : ""}`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                            <div className="vertical-dialer-set">
                                {navItems.map((item) => (
                                    <button
                                        key={`set2-${item.id}`}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`vertical-dialer-btn ${activeTab === item.id ? "active" : ""}`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            <div className="top-auth-actions-floating">
                {isAuthenticated ? (
                    <>
                        <span className="top-auth-username">Hi, {user?.name?.split(" ")[0]}</span>
                        {(user?.role === "admin" || user?.role === "theatre-admin") && (
                            <Link to="/admin/dashboard" className="top-auth-dashboard-btn">
                                Dashboard
                            </Link>
                        )}
                        <button onClick={handleLogout} className="top-auth-logout-btn">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="top-auth-login-link">
                            Login
                        </Link>
                        <Link to="/register" className="top-auth-register-btn">
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </>
    )
}

export default Navbar