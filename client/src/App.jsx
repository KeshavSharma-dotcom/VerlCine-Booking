import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { checkAuthSession } from "./redux/thunks/authThunks.js"
import { Home } from "./pages/Home"
import { LoginPage } from "./pages/auth/Login"
import { RegisterPage } from "./pages/auth/Register"
// import BookingHistory from "./pages/user/HistoryPage"
import ProtectedRoute from "./routes/ProtectedRoute"
import GuestRoute from "./routes/GuestRoute"

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(checkAuthSession())
  }, [dispatch])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        {/* <Route
          path="/history"
          element={
            <ProtectedRoute>
              <BookingHistory />
            </ProtectedRoute>
          }
        /> */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}