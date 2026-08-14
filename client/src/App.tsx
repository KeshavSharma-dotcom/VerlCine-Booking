import React, { useEffect } from "react"
import { Routes, Route, Navigate, Link } from "react-router-dom"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { PrivacySettings } from "./features/authentication/components/PrivacySettings"
import { useGetCurrentUserQuery, useLogoutMutation } from "./features/authentication/services/authApi"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { setCredentials, logoutState } from "./features/authentication/store/authSlice"

const App: React.FC = () => {
    const dispatch = useAppDispatch()
    const { user, isAuthenticated } = useAppSelector((state) => state.auth)
    const { data, isLoading } = useGetCurrentUserQuery()
    const [logout] = useLogoutMutation()

    useEffect(() => {
        if (data?.success && data?.user) {
            dispatch(setCredentials({ user: data.user }))
        }
    }, [data, dispatch])

    const handleLogout = async () => {
        try {
            await logout().unwrap()
            dispatch(logoutState())
        } catch (err) {
            console.error(err)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-medium">
                Loading session...
            </div>
        )
    }

    return (
        <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
            <Route
                path="/"
                element={
                    <div className="min-h-screen bg-slate-900 text-white p-6">
                        <header className="max-w-4xl mx-auto flex items-center justify-between pb-6 border-b border-slate-800 mb-8">
                            <h1 className="text-2xl font-bold text-indigo-400">Movie Booking Hub</h1>
                            <div className="flex items-center gap-4">
                                {isAuthenticated && user ? (
                                    <>
                                        <span className="text-slate-300 font-medium">Hi, {user.name}</span>
                                        <button onClick={handleLogout} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-semibold rounded-lg border border-slate-700 cursor-pointer">
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex gap-3">
                                        <Link to="/login" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-semibold rounded-lg border border-slate-700">
                                            Login
                                        </Link>
                                        <Link to="/register" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold rounded-lg">
                                            Register
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </header>

                        <main className="max-w-4xl mx-auto space-y-8">
                            {isAuthenticated ? (
                                <section>
                                    <h2 className="text-lg font-semibold text-slate-300 mb-4">Account Settings & Security</h2>
                                    <PrivacySettings />
                                </section>
                            ) : (
                                <div className="text-center py-12 text-slate-400">
                                    Please log in or create an account to view and manage your settings.
                                </div>
                            )}
                        </main>
                    </div>
                }
            />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    )
}

export default App