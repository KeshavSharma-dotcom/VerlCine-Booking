import { useSelector } from "react-redux"
import { Navigate, Outlet } from "react-router-dom"

const ProtectedRoute = () => {
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth)

  if (!isInitialized) {
    return null
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute