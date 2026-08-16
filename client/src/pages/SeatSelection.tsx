import React, { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { socket } from "../core/socket/socket"
import { useGetShowtimeSeatsQuery } from "../features/booking/services/bookingApi"
import { SeatMatrix } from "../features/booking/components/SeatMatrix"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { setSelectedSeat, clearSelectedSeat } from "../features/booking/store/bookingSlice"
import type { ISeat } from "../core/types"
import "../assets/styles/booking.css"

export const SeatSelection: React.FC = () => {
    const { showtimeId = "st-101" } = useParams<{ showtimeId: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const { user } = useAppSelector((state) => state.auth)
    const { selectedSeat, lockExpiration } = useAppSelector((state) => state.booking)
    const { data, isLoading } = useGetShowtimeSeatsQuery(showtimeId)

    const [seats, setSeats] = useState<ISeat[]>([])
    const [timeLeft, setTimeLeft] = useState<number>(0)

    useEffect(() => {
        if (data?.seats) {
            setSeats(data.seats)
        }
    }, [data])

    useEffect(() => {
        socket.emit("join:showtime", { showtimeId })

        socket.on("seat:locked", (payload: { seatNumber: string; lockedBy: string; expiresAt: number }) => {
            setSeats((prev) =>
                prev.map((s) => (s.seatNumber === payload.seatNumber ? { ...s, status: "locked", lockedBy: payload.lockedBy } : s))
            )
        })

        socket.on("seat:unlocked", (payload: { seatNumber: string }) => {
            setSeats((prev) =>
                prev.map((s) => (s.seatNumber === payload.seatNumber ? { ...s, status: "available", lockedBy: null } : s))
            )
            if (selectedSeat === payload.seatNumber) {
                dispatch(clearSelectedSeat())
            }
        })

        socket.on("seat:booked", (payload: { seatNumber: string }) => {
            setSeats((prev) =>
                prev.map((s) => (s.seatNumber === payload.seatNumber ? { ...s, status: "booked", lockedBy: null } : s))
            )
            if (selectedSeat === payload.seatNumber) {
                dispatch(clearSelectedSeat())
            }
        })

        return () => {
            socket.emit("leave:showtime", { showtimeId })
            socket.off("seat:locked")
            socket.off("seat:unlocked")
            socket.off("seat:booked")
        }
    }, [showtimeId, selectedSeat, dispatch])

    useEffect(() => {
        if (!lockExpiration) {
            setTimeLeft(0)
            return
        }

        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.floor((lockExpiration - Date.now()) / 1000))
            setTimeLeft(remaining)
            if (remaining === 0) {
                dispatch(clearSelectedSeat())
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [lockExpiration, dispatch])

    const handleSelectSeat = (seatNumber: string) => {
        if (selectedSeat === seatNumber) {
            socket.emit("seat:unlock", { showtimeId, seatNumber })
            dispatch(clearSelectedSeat())
            return
        }

        if (selectedSeat) {
            socket.emit("seat:unlock", { showtimeId, seatNumber: selectedSeat })
        }

        const expiresAt = Date.now() + 10 * 60 * 1000
        socket.emit("seat:lock", { showtimeId, seatNumber, userId: user?.id })
        dispatch(setSelectedSeat({ seatNumber, showtimeId, expiresAt }))
    }

    return (
        <div className="booking-page-container">
            <header className="booking-header">
                <Link to="/" className="text-sm text-indigo-400 hover:underline">← Exit to Catalog</Link>
                <h1 className="text-lg font-bold">Select Your Seat</h1>
                <div className="text-xs text-slate-400">1 Seat Limit</div>
            </header>

            <main className="booking-layout">
                {isLoading ? (
                    <div className="lg:col-span-2 text-center py-20 text-slate-400">Loading seat map...</div>
                ) : (
                    <SeatMatrix
                        seats={seats}
                        currentUserId={user?.id}
                        selectedSeat={selectedSeat}
                        onSelectSeat={handleSelectSeat}
                    />
                )}

                <div className="booking-summary-card">
                    <h2 className="text-xl font-bold border-b border-slate-700 pb-3">Booking Summary</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-slate-300">
                            <span>Selected Seat:</span>
                            <span className="font-semibold text-white">{selectedSeat || "None selected"}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                            <span>Price:</span>
                            <span className="font-semibold text-white">{selectedSeat ? "₹250.00" : "₹0.00"}</span>
                        </div>
                    </div>

                    {selectedSeat && timeLeft > 0 && (
                        <div className="timer-badge">
                            <span>Seat locked for:</span>
                            <span className="font-mono text-sm font-bold">
                                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                            </span>
                        </div>
                    )}

                    <button
                        disabled={!selectedSeat}
                        onClick={() => navigate(`/checkout/${showtimeId}?seat=${selectedSeat}`)}
                        className="checkout-btn"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </main>
        </div>
    )
}