import React, { useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { logoutUserThunk } from "../redux/thunks/authThunks"
import namedLogo from "../assets/images/namedLogo.png"
import "../assets/styles/verticalDialer.css"

export const Navbar = ({ activeTab = "all", setActiveTab }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { isAuthenticated, user } = useSelector((state) => state.auth)
    const dialerRef = useRef(null)

    const navItems = [
        { id: "all", label: "All" },
        { id: "movies", label: "Movies" },
        { id: "shows", label: "Shows" }
    ]

    const currentIndex = navItems.findIndex((item) => item.id === activeTab)
    const safeIndex = currentIndex === -1 ? 0 : currentIndex

    useEffect(() => {
        const dialerElement = dialerRef.current
        if (!dialerElement || !setActiveTab) return

        const onWheel = (e) => {
            e.preventDefault()
            e.stopPropagation()

            if (e.deltaY > 0) {
                const nextIndex = (safeIndex + 1) % navItems.length
                setActiveTab(navItems[nextIndex].id)
            } else if (e.deltaY < 0) {
                const prevIndex = (safeIndex - 1 + navItems.length) % navItems.length
                setActiveTab(navItems[prevIndex].id)
            }
        }

        dialerElement.addEventListener("wheel", onWheel, { passive: false })

        return () => {
            dialerElement.removeEventListener("wheel", onWheel)
        }
    }, [safeIndex, setActiveTab])

    const handleLogout = async () => {
        await dispatch(logoutUserThunk())
        navigate("/")
    }

    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U"
    const translateY = (safeIndex * -48) + 70

    return (
        <aside className="vertical-navbar-container">
            <Link to="/" className="vertical-brand-logo-container">
                <img
                    src={namedLogo}
                    alt="CineVerl Logo"
                    className="vertical-brand-logo-img"
                />
            </Link>

            {setActiveTab && (
                <div className="vertical-dialer-wrap" ref={dialerRef}>
                    <div
                        className="vertical-dialer-track"
                        style={{ transform: `translateY(${translateY}px)` }}
                    >
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`vertical-dialer-btn ${activeTab === item.id ? "active" : ""}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="bottom-left-profile-widget">
                {isAuthenticated ? (
                    <>
                        <div className="profile-dropdown-menu">
                            <Link to="/profile" className="profile-dropdown-item accent">
                                Profile
                            </Link>
                            <Link to="/settings" className="profile-dropdown-item">
                                Settings
                            </Link>
                            {(user?.role === "admin" || user?.role === "theatre-admin" || user?.role === "theatre_admin") && (
                                <Link to="/admin/dashboard" className="profile-dropdown-item">
                                    Admin Dashboard
                                </Link>
                            )}
                            <button onClick={handleLogout} className="profile-dropdown-item danger">
                                Logout
                            </button>
                        </div>

                        <div className="profile-trigger-card">
                            <div className="profile-avatar-circle">
                                {userInitial}
                            </div>
                            <div className="profile-meta-wrap">
                                <span className="profile-meta-name">{user?.name || "Member"}</span>
                                <span className="profile-meta-role">{user?.role || "Viewer"}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <Link to="/login" className="profile-login-prompt">
                        Sign In
                    </Link>
                )}
            </div>
        </aside>
    )
}

export default Navbar