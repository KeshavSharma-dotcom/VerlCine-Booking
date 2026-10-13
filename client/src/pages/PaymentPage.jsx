import React, { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
    PaymentMovieCard,
    PaymentSeatDetails,
    PaymentPriceBreakup,
    PaymentMethodSelector
} from "../components/payment/payment"
import { processBookingPayment } from "../redux/thunks/bookingThunks"
import { getSavedSeats, clearSavedSeats } from "../utils/seatStorage"
import "../assets/styles/paymentPage.css"

export const PaymentPage = () => {
    const { showtimeId, bookingId } = useParams()
    const targetShowtimeId = showtimeId || bookingId
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { user } = useSelector((state) => state.auth || {})
    const { checkoutLoading } = useSelector((state) => state.booking || {})

    const [showtime, setShowtime] = useState(location.state?.showtime || null)
    const [seatsBooked, setSeatsBooked] = useState(() => {
        if (location.state?.seatsBooked && location.state.seatsBooked.length > 0) {
            return location.state.seatsBooked
        }
        const stored = getSavedSeats(targetShowtimeId)
        return (stored.seats || []).map((s) => s.seatNumber || s)
    })
    const [loading, setLoading] = useState(!location.state?.showtime)
    const [error, setError] = useState(null)
    const [selectedGateway, setSelectedGateway] = useState("upi")

    useEffect(() => {
        if (!targetShowtimeId) {
            setError("Invalid showtime session")
            setLoading(false)
            return
        }

        const stored = getSavedSeats(targetShowtimeId)
        const currentSeats = seatsBooked.length > 0 ? seatsBooked : (stored.seats || []).map((s) => s.seatNumber || s)

        if (currentSeats.length === 0) {
            setError("No seats selected. Please choose your seats first.")
            setLoading(false)
            return
        }

        if (seatsBooked.length === 0 && currentSeats.length > 0) {
            setSeatsBooked(currentSeats)
        }

        if (!showtime) {
            const fetchShowtime = async () => {
                try {
                    setLoading(true)
                    let res = await fetch(`/api/v1/showtimes/${targetShowtimeId}`)
                    if (!res.ok) res = await fetch(`/api/showtimes/${targetShowtimeId}`)

                    const data = await res.json()
                    const resolved = data.showtime || data.data || data
                    if (!resolved || !resolved._id) {
                        throw new Error("Unable to locate showtime session")
                    }
                    setShowtime(resolved)
                } catch (err) {
                    setError(err.message || "Failed to load showtime")
                } finally {
                    setLoading(false)
                }
            }
            fetchShowtime()
        }
    }, [targetShowtimeId])

    const totalAmount = seatsBooked.reduce((sum, seatNum) => {
        const foundSeat = showtime?.seats?.find((s) => s.seatNumber === seatNum)
        return sum + (foundSeat?.price || showtime?.ticketPrice || 250)
    }, 0)

    const handleInitiatePayment = async () => {
        try {
            const resultAction = await dispatch(
                processBookingPayment({
                    showtimeId: targetShowtimeId,
                    seatsBooked: seatsBooked,
                    userProfile: user
                })
            )

            if (processBookingPayment.fulfilled.match(resultAction)) {
                const confirmedBooking = resultAction.payload
                clearSavedSeats(targetShowtimeId)
                navigate(`/booking-success/${confirmedBooking._id}`)
            } else {
                alert(resultAction.payload || "Payment transaction failed")
            }
        } catch (err) {
            alert(err.message || "Unexpected gateway failure")
        }
    }

    if (loading) {
        return (
            <div className="payment-state-screen">
                <div className="payment-state-spinner" />
                <p>Preparing checkout overview...</p>
            </div>
        )
    }

    if (error || !showtime) {
        return (
            <div className="payment-state-screen">
                <p>{error || "Showtime not found"}</p>
                <button
                    type="button"
                    onClick={() => navigate(`/seat-booking/${targetShowtimeId}`)}
                    className="payment-header-back-btn"
                >
                    Return to Seating Map
                </button>
            </div>
        )
    }

    const bookingMock = {
        movie: showtime.movie,
        showtime: showtime,
        seatsBooked: seatsBooked,
        totalAmount: totalAmount
    }

    return (
        <div className="payment-page-container">
            <main className="payment-page-wrap">
                <header className="payment-page-header">
                    <button
                        type="button"
                        onClick={() => navigate(`/seat-booking/${targetShowtimeId}`)}
                        className="payment-header-back-btn"
                    >
                        ← Back to Seat Selection
                    </button>
                    <h1 className="payment-main-title">Review & Pay</h1>
                </header>

                <div className="payment-content-grid">
                    <div className="payment-left-column">
                        <PaymentMovieCard booking={bookingMock} />
                        <PaymentSeatDetails seats={seatsBooked} />
                    </div>

                    <div className="payment-right-column">
                        <PaymentPriceBreakup
                            totalAmount={totalAmount}
                            seatCount={seatsBooked.length}
                        />
                        <PaymentMethodSelector
                            selectedGateway={selectedGateway}
                            setSelectedGateway={setSelectedGateway}
                            loading={checkoutLoading}
                            onInitiatePayment={handleInitiatePayment}
                            totalAmount={totalAmount}
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default PaymentPage