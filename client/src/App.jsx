import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { checkAuthThunk } from "./redux/thunks/authThunks"
import Home from "./pages/Home"
import MovieDetail from "./pages/MovieDetail"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import ProtectedRoute from "./routes/ProtectedRoute"
import GuestRoute from "./routes/GuestRoute"

export default function App() {
  const dispatch = useDispatch()
  const { isInitialized } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(checkAuthThunk())
  }, [dispatch])

  if (!isInitialized) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "2.5rem", height: "2.5rem", border: "3px solid var(--color-border-subtle)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetail />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/booking/:showtimeId" element={<MovieDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}