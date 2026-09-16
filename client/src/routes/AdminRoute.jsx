import React from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"

export const AdminRoute = ({ allowedRoles = ["admin", "theatre-admin", "theatre_admin"] }) => {
    const location = useLocation()
    const { isAuthenticated, isInitialized, user } = useSelector((state) => state.auth)

    if (!isInitialized) {
        return (
            <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", border: "3px solid var(--color-border-subtle)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    const hasAccess = user && allowedRoles.includes(user.role)

    if (!hasAccess) {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default AdminRoute