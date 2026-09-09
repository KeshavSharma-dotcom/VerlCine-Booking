import { useSelector } from "react-redux"
import { Navigate, Outlet } from "react-router-dom"

const GuestRoute = () => {
    const { isAuthenticated, isInitialized } = useSelector((state) => state.auth)

    if (!isInitialized) {
        return null
    }

    return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}

export default GuestRoute