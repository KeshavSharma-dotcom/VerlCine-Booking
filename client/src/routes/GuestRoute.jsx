import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const GuestRoute = ({ children }) => {
    const { isAuthenticated, loading } = useSelector((state) => state.auth)

    if (loading) {
        return <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center text-slate-400">Loading...</div>
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return children
}

export default GuestRoute