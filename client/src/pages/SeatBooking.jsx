import React, { useEffect, useState, useMemo, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { io } from "socket.io-client"
import "../assets/styles/seatMatrix.css"

export const SeatBooking = () => {
    const { showtimeId } = useParams()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)

    const [showtime, setShowtime] = useState(null)
    const [seats, setSeats] = useState([])
    const [selectedSeats, setSelectedSeats] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const socketRef = useRef(null)

    useEffect(() => {
        const fetchShowtimeDetails = async () => {
            try {
                const response = await fetch(`/api/showtimes/${showtimeId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                })
                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data.message || "Failed to load showtime matrix")
                }
                setShowtime(data.showtime)
                setSeats(data.showtime.seats || [])
                setLoading(false)
            } catch (err) {
                setError(err.message || "Failed to load showtime matrix")
                setLoading(false)
            }
        }

        fetchShowtimeDetails()

        const socketInstance = io(window.location.origin, {
            path: "/socket.io"
        })
        socketRef.current = socketInstance

        socketInstance.emit("join-showtime", { showtimeId })

        socketInstance.on("seats-updated", ({ updatedSeats }) => {
            setSeats((prev) =>
                prev.map((s) => {
                    const match = updatedSeats.find((u) => u.seatNumber === s.seatNumber)
                    return match ? { ...s, ...match } : s
                })
            )
        })

        socketInstance.on("seat-lock-expired", ({ expiredSeatNumbers }) => {
            setSeats((prev) =>
                prev.map((s) =>
                    expiredSeatNumbers.includes(s.seatNumber)
                        ? { ...s, status: "available", lockedBy: null, lockedUntil: null }
                        : s
                )
            )
            setSelectedSeats((prev) => prev.filter((num) => !expiredSeatNumbers.includes(num)))
        })

        return () => {
            socketInstance.emit("leave-showtime", { showtimeId })
            socketInstance.disconnect()
            socketRef.current = null
        }
    }, [showtimeId])

    const groupedRows = useMemo(() => {
        const rows = {}
        seats.forEach((seat) => {
            const rowLabel = seat.seatNumber.charAt(0)
            if (!rows[rowLabel]) {
                rows[rowLabel] = []
            }
            rows[rowLabel].push(seat)
        })

        Object.keys(rows).forEach((rowKey) => {
            rows[rowKey].sort((a, b) => {
                const numA = parseInt(a.seatNumber.substring(1), 10)
                const numB = parseInt(b.seatNumber.substring(1), 10)
                return numA - numB
            })
        })

        return Object.entries(rows).sort(([a], [b]) => a.localeCompare(b))
    }, [seats])

    const handleSeatClick = (seat) => {
        if (!user?._id) {
            navigate("/login")
            return
        }

        if (seat.status === "booked") return
        if (seat.status === "locked" && seat.lockedBy !== user._id) return

        const socketInstance = socketRef.current
        if (!socketInstance) return

        if (selectedSeats.includes(seat.seatNumber)) {
            setSelectedSeats(selectedSeats.filter((num) => num !== seat.seatNumber))
            socketInstance.emit("unlock-seat", {
                showtimeId,
                seatNumber: seat.seatNumber,
                userId: user._id
            })
        } else {
            if (selectedSeats.length >= 6) {
                return
            }
            setSelectedSeats([...selectedSeats, seat.seatNumber])
            socketInstance.emit("lock-seat", {
                showtimeId,
                seatNumber: seat.seatNumber,
                userId: user._id
            })
        }
    }

    const getSeatClassName = (seat) => {
        if (seat.status === "booked") return "seat-unit booked"
        if (selectedSeats.includes(seat.seatNumber)) return "seat-unit selected"
        if (seat.status === "locked") return "seat-unit locked"
        return "seat-unit available"
    }

    const totalPrice = selectedSeats.length * (showtime?.ticketPrice || 0)

    const handleCheckoutProceed = () => {
        navigate(`/checkout/${showtimeId}`, {
            state: {
                selectedSeats,
                showtime,
                totalPrice
            }
        })
    }

    if (loading) {
        return (
            <div className="seat-matrix-wrapper">
                <div className="seat-matrix-loading">
                    <div className="home-spinner"></div>
                    <p style={{ color: "var(--color-text-secondary)" }}>Configuring seat matrix...</p>
                </div>
            </div>
        )
    }

    if (error || !showtime) {
        return (
            <div className="seat-matrix-wrapper">
                <div className="seat-matrix-loading">
                    <p style={{ color: "var(--color-danger)" }}>{error || "Showtime not found"}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="seat-checkout-btn"
                        style={{ marginTop: "1rem" }}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="seat-matrix-wrapper">
            <main className="seat-matrix-container">
                <div className="seat-matrix-header">
                    <div>
                        <h1 className="seat-matrix-title">{showtime.movie?.title}</h1>
                        <div className="seat-matrix-meta">
                            <span>{showtime.theatre?.name}</span>
                            <span>•</span>
                            <span>Screen {showtime.screenNumber}</span>
                            <span>•</span>
                            <span>{new Date(showtime.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                    </div>
                    <div className="seat-matrix-timer-badge">
                        ₹{showtime.ticketPrice} / ticket
                    </div>
                </div>

                <div className="seat-screen-display">
                    <div className="seat-screen-curve"></div>
                    <span className="seat-screen-label">ALL EYES THIS WAY</span>
                </div>

                <div className="seat-legend">
                    <div className="seat-legend-item">
                        <span className="seat-legend-dot available"></span>
                        <span>Available</span>
                    </div>
                    <div className="seat-legend-item">
                        <span className="seat-legend-dot selected"></span>
                        <span>Selected</span>
                    </div>
                    <div className="seat-legend-item">
                        <span className="seat-legend-dot locked"></span>
                        <span>Reserved/Holding</span>
                    </div>
                    <div className="seat-legend-item">
                        <span className="seat-legend-dot booked"></span>
                        <span>Booked</span>
                    </div>
                </div>

                <div className="seat-grid">
                    {groupedRows.map(([rowLabel, rowSeats]) => (
                        <div key={rowLabel} className="seat-row">
                            <span className="seat-row-label">{rowLabel}</span>
                            {rowSeats.map((seat) => (
                                <button
                                    key={seat._id || seat.seatNumber}
                                    className={getSeatClassName(seat)}
                                    onClick={() => handleSeatClick(seat)}
                                    disabled={seat.status === "booked" || (seat.status === "locked" && seat.lockedBy !== user?._id)}
                                >
                                    {seat.seatNumber.substring(1)}
                                </button>
                            ))}
                            <span className="seat-row-label">{rowLabel}</span>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="seat-checkout-bar">
                <div className="seat-checkout-inner">
                    <div className="seat-checkout-details">
                        <span className="seat-selected-list">
                            {selectedSeats.length > 0
                                ? `Seats: ${selectedSeats.join(", ")}`
                                : "Select your seats (Up to 6)"}
                        </span>
                        <span className="seat-total-price">
                            ₹{totalPrice}
                        </span>
                    </div>

                    <button
                        className="seat-checkout-btn"
                        disabled={selectedSeats.length === 0}
                        onClick={handleCheckoutProceed}
                    >
                        Proceed to Payment
                    </button>
                </div>
            </footer>
        </div>
    )
}

export default SeatBooking