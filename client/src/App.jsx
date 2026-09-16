import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { checkAuthThunk } from "./redux/thunks/authThunks"
import Navbar from "./components/NavBar"
import Home from "./pages/Home"
import MovieDetail from "./pages/MovieDetail"
import SeatBooking from "./pages/SeatBooking"
import AdminDashboard from "./pages/admin/AdminDashboard"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import ProtectedRoute from "./routes/ProtectedRoute"
import GuestRoute from "./routes/GuestRoute"
import AdminRoute from "./routes/AdminRoute"

export default function App() {
  const dispatch = useDispatch()
  const { isInitialized } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(checkAuthThunk())
  }, [dispatch])

  if (!isInitialized) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0A0F1D", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "2.5rem", height: "2.5rem", border: "3px solid #24304D", borderTopColor: "#3B82F6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    )
  }

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetail />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/booking/:showtimeId" element={<SeatBooking />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}