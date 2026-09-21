import React, { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { io } from "socket.io-client"
import {
    BookingMovieHeader,
    BookingScreenCurve,
    BookingSeatMatrix,
    BookingSeatLegend,
    BookingCheckoutBar
} from "../components/booking/booking"
import "../assets/styles/seatBooking.css"

export const SeatBooking = () => {
    const { showtimeId, movieId } = useParams()
    const targetId = showtimeId || movieId
    const navigate = useNavigate()

    const { isAuthenticated, user } = useSelector((state) => state.auth || {})

    const [showtime, setShowtime] = useState(null)
    const [selectedSeats, setSelectedSeats] = useState([])
    const [loading, setLoading] = useState(true)
    const [bookingLoading, setBookingLoading] = useState(false)
    const [error, setError] = useState(null)

    const socketRef = useRef(null)

    useEffect(() => {
        if (!targetId) {
            setError("Invalid showtime session")
            setLoading(false)
            return
        }

        const fetchShowtime = async () => {
            try {
                setLoading(true)
                setError(null)

                let res = await fetch(`/api/v1/showtimes/${targetId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                })

                if (!res.ok) {
                    res = await fetch(`/api/showtimes/${targetId}`, {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include"
                    })
                }

                const data = await res.json()
                const resolved = data.showtime || data.data || data

                if (!res.ok || !resolved || !resolved._id) {
                    throw new Error(data.message || "Unable to locate showtime session")
                }

                setShowtime(resolved)
            } catch (err) {
                setError(err.message || "Failed to load seat layout")
            } finally {
                setLoading(false)
            }
        }

        fetchShowtime()

        const socketInstance = io(window.location.origin, {
            path: "/socket.io"
        })
        socketRef.current = socketInstance

        socketInstance.emit("join-showtime", { showtimeId: targetId })

        socketInstance.on("seats-updated", ({ updatedSeats }) => {
            if (!Array.isArray(updatedSeats)) return
            setShowtime((prev) => {
                if (!prev) return prev
                const newSeats = (prev.seats || []).map((s) => {
                    const match = updatedSeats.find((u) => u.seatNumber === s.seatNumber)
                    return match ? { ...s, ...match } : s
                })
                return { ...prev, seats: newSeats }
            })
        })

        socketInstance.on("seat-lock-expired", ({ expiredSeatNumbers }) => {
            if (!Array.isArray(expiredSeatNumbers)) return
            setShowtime((prev) => {
                if (!prev) return prev
                const newSeats = (prev.seats || []).map((s) =>
                    expiredSeatNumbers.includes(s.seatNumber)
                        ? { ...s, status: "available", lockedBy: null, lockedUntil: null }
                        : s
                )
                return { ...prev, seats: newSeats }
            })
            setSelectedSeats((prev) =>
                prev.filter((s) => !expiredSeatNumbers.includes(s.seatNumber))
            )
        })

        return () => {
            socketInstance.emit("leave-showtime", { showtimeId: targetId })
            socketInstance.disconnect()
            socketRef.current = null
        }
    }, [targetId])

    const handleSeatClick = (seat) => {
        if (seat.status === "booked") return
        if (seat.status === "locked" && seat.lockedBy && seat.lockedBy !== user?._id) return

        const socketInstance = socketRef.current
        const exists = selectedSeats.find((s) => s.seatNumber === seat.seatNumber)

        if (exists) {
            setSelectedSeats((prev) => prev.filter((s) => s.seatNumber !== seat.seatNumber))
            if (socketInstance && user?._id) {
                socketInstance.emit("unlock-seat", {
                    showtimeId: targetId,
                    seatNumber: seat.seatNumber,
                    userId: user._id
                })
            }
        } else {
            if (selectedSeats.length >= 8) {
                alert("Maximum 8 seats per booking allowed")
                return
            }
            setSelectedSeats((prev) => [...prev, seat])
            if (socketInstance && user?._id) {
                socketInstance.emit("lock-seat", {
                    showtimeId: targetId,
                    seatNumber: seat.seatNumber,
                    userId: user._id
                })
            }
        }
    }

    const handleConfirmBooking = async () => {
        if (!isAuthenticated) {
            navigate("/login")
            return
        }

        if (selectedSeats.length === 0) {
            alert("Please select at least one seat to continue")
            return
        }

        try {
            setBookingLoading(true)
            const seatNumbers = selectedSeats.map((s) => s.seatNumber)
            const payload = {
                showtimeId: showtime._id,
                seats: seatNumbers,
                totalAmount: selectedSeats.length * (showtime.ticketPrice || 250)
            }

            let res = await fetch("/api/v1/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                res = await fetch("/api/bookings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(payload)
                })
            }

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Booking creation failed")

            navigate(`/booking-success/${data.booking?._id || ""}`)
        } catch (err) {
            alert(err.message || "Failed to reserve seats")
        } finally {
            setBookingLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="seat-booking-container">
                <div className="booking-loading-state">
                    <div className="booking-spinner" />
                    <p>Loading real-time seat matrix...</p>
                </div>
            </div>
        )
    }

    if (error || !showtime) {
        return (
            <div className="seat-booking-container">
                <div className="booking-error-state">
                    <p>{error || "Showtime not found"}</p>
                    <button onClick={() => navigate(-1)} className="booking-back-btn">
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="seat-booking-container">
            <main className="seat-booking-wrap">
                <BookingMovieHeader showtime={showtime} />

                <section className="booking-seat-matrix-section">
                    <BookingScreenCurve />

                    <BookingSeatMatrix
                        seats={showtime.seats || []}
                        ticketPrice={showtime.ticketPrice || 250}
                        selectedSeats={selectedSeats}
                        onSeatClick={handleSeatClick}
                    />

                    <BookingSeatLegend />

                    <BookingCheckoutBar
                        selectedSeats={selectedSeats}
                        ticketPrice={showtime.ticketPrice || 250}
                        bookingLoading={bookingLoading}
                        onConfirmBooking={handleConfirmBooking}
                    />
                </section>
            </main>
        </div>
    )
}

export default SeatBooking