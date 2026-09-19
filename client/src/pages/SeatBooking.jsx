import React, { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import "../assets/styles/seatBooking.css"

export const SeatBooking = () => {
    const { movieId, showtimeId } = useParams()
    const targetMovieId = movieId || showtimeId
    const navigate = useNavigate()

    const { isAuthenticated } = useSelector((state) => state.auth)
    const { selectedCity } = useSelector((state) => state.theatre)

    const [movie, setMovie] = useState(null)
    const [showtimes, setShowtimes] = useState([])
    const [selectedShowtime, setSelectedShowtime] = useState(null)
    const [selectedSeats, setSelectedSeats] = useState([])
    const [loading, setLoading] = useState(true)
    const [bookingLoading, setBookingLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchBookingData = async () => {
            try {
                setLoading(true)
                setError(null)

                let movieRes = await fetch(`/api/v1/movies/${targetMovieId}`)
                if (!movieRes.ok) {
                    movieRes = await fetch(`/api/movies/${targetMovieId}`)
                }
                if (!movieRes.ok) {
                    movieRes = await fetch(`/api/movie/${targetMovieId}`)
                }

                const movieData = await movieRes.json()
                if (!movieRes.ok || (!movieData.movie && !movieData.data && !movieData._id)) {
                    throw new Error(movieData.message || "Failed to load movie details")
                }

                const resolvedMovie = movieData.movie || movieData.data || movieData
                setMovie(resolvedMovie)

                const cityParam = encodeURIComponent(selectedCity || "Mumbai")
                let showtimesRes = await fetch(`/api/v1/showtimes?movieId=${targetMovieId}&movie=${targetMovieId}&city=${cityParam}`)
                if (!showtimesRes.ok) {
                    showtimesRes = await fetch(`/api/showtimes?movieId=${targetMovieId}&movie=${targetMovieId}&city=${cityParam}`)
                }

                if (!showtimesRes.ok) {
                    showtimesRes = await fetch(`/api/v1/showtimes?movieId=${targetMovieId}&movie=${targetMovieId}`)
                }

                const showtimesData = await showtimesRes.json()
                const list = showtimesData.showtimes || showtimesData.data || (Array.isArray(showtimesData) ? showtimesData : [])

                if (Array.isArray(list) && list.length > 0) {
                    setShowtimes(list)
                    setSelectedShowtime(list[0])
                } else {
                    setShowtimes([])
                }
            } catch (err) {
                setError(err.message || "Error retrieving showtimes")
            } finally {
                setLoading(false)
            }
        }

        if (targetMovieId) {
            fetchBookingData()
        }
    }, [targetMovieId, selectedCity])

    const groupedByTheatre = useMemo(() => {
        const map = new Map()
        showtimes.forEach((st) => {
            const theatreObj = typeof st.theatre === "object" ? st.theatre : null
            const theatreId = theatreObj?._id || st.theatre || "default-theatre"

            if (!map.has(theatreId)) {
                map.set(theatreId, {
                    theatre: theatreObj || { name: "Cinema Hall", city: selectedCity, address: selectedCity },
                    shows: []
                })
            }
            map.get(theatreId).shows.push(st)
        })
        return Array.from(map.values())
    }, [showtimes, selectedCity])

    const handleSeatClick = (seat) => {
        if (seat.status !== "available") return

        const exists = selectedSeats.find((s) => s.seatNumber === seat.seatNumber)
        if (exists) {
            setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber))
        } else {
            if (selectedSeats.length >= 8) {
                alert("Maximum 8 seats per booking session allowed")
                return
            }
            setSelectedSeats([...selectedSeats, seat])
        }
    }

    const handleSelectShowtime = (show) => {
        setSelectedShowtime(show)
        setSelectedSeats([])
    }

    const handleConfirmBooking = async () => {
        if (!isAuthenticated) {
            navigate("/login")
            return
        }

        if (selectedSeats.length === 0 || !selectedShowtime) {
            alert("Please select at least one seat to continue")
            return
        }

        try {
            setBookingLoading(true)
            const seatNumbers = selectedSeats.map((s) => s.seatNumber)

            let response = await fetch("/api/v1/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    showtimeId: selectedShowtime._id,
                    seats: seatNumbers,
                    totalAmount: selectedSeats.length * (selectedShowtime.ticketPrice || 250)
                })
            })

            if (!response.ok) {
                response = await fetch("/api/bookings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        showtimeId: selectedShowtime._id,
                        seats: seatNumbers,
                        totalAmount: selectedSeats.length * (selectedShowtime.ticketPrice || 250)
                    })
                })
            }

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Booking creation failed")
            }

            navigate(`/booking-success/${data.booking?._id || ""}`)
        } catch (err) {
            alert(err.message || "Unable to lock seats. They may have been booked just now.")
        } finally {
            setBookingLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="seat-booking-container">
                <div className="booking-loading-state">
                    <div className="booking-spinner"></div>
                    <p>Loading real showtimes & seating layout in {selectedCity}...</p>
                </div>
            </div>
        )
    }

    if (error || !movie) {
        return (
            <div className="seat-booking-container">
                <div className="booking-error-state">
                    <p>{error || "Movie not found"}</p>
                    <button onClick={() => navigate("/")} className="booking-back-btn">
                        Back to Home
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="seat-booking-container">
            <main className="seat-booking-wrap">
                <header className="booking-movie-header">
                    <div className="booking-poster-box">
                        <img src={movie.posterUrl} alt={movie.title} className="booking-poster-img" />
                    </div>
                    <div className="booking-movie-meta">
                        <span className="booking-pill-badge">{movie.rating || "PG-13"}</span>
                        <h1 className="booking-movie-title">{movie.title}</h1>
                        <p className="booking-movie-genres">
                            {Array.isArray(movie.genre) ? movie.genre.join(" • ") : movie.genre} | {movie.durationMinutes} mins
                        </p>
                        <p className="booking-region-notice">
                            Displaying real screens in <strong>{selectedCity}</strong>
                        </p>
                    </div>
                </header>

                <section className="booking-theatres-section">
                    <h2 className="booking-section-heading">Available Cinemas & Time Slots</h2>

                    {groupedByTheatre.length === 0 ? (
                        <div className="booking-empty-theatres">
                            <p>No showtimes scheduled for this title in {selectedCity} right now.</p>
                            <span>Try selecting another region from the city selector.</span>
                        </div>
                    ) : (
                        <div className="theatres-showtimes-list">
                            {groupedByTheatre.map(({ theatre, shows }) => (
                                <div
                                    key={theatre?._id || Math.random()}
                                    className={`theatre-showtime-block ${selectedShowtime?.theatre?._id === theatre?._id ? "active-theatre" : ""}`}
                                >
                                    <div className="theatre-info-panel">
                                        <h3 className="theatre-name">{theatre?.name || "Cinema Hall"}</h3>
                                        <p className="theatre-address">{theatre?.address || selectedCity}</p>
                                    </div>

                                    <div className="theatre-slots-grid">
                                        {shows.map((show) => {
                                            const isSelected = selectedShowtime?._id === show._id
                                            const dateObj = new Date(show.startTime)
                                            const timeString = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

                                            return (
                                                <button
                                                    key={show._id}
                                                    onClick={() => handleSelectShowtime(show)}
                                                    className={`theatre-slot-pill ${isSelected ? "selected-slot" : ""}`}
                                                >
                                                    <span className="slot-time">{timeString}</span>
                                                    <span className="slot-price">₹{show.ticketPrice || 250}</span>
                                                    <span className="slot-screen">Screen {show.screenNumber || 1}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {selectedShowtime && (
                    <section className="booking-seat-matrix-section">
                        <div className="screen-indicator-box">
                            <div className="screen-curve"></div>
                            <span className="screen-label">CINEMA SCREEN</span>
                        </div>

                        <div className="seat-grid-container">
                            <div className="seat-grid-layout">
                                {(selectedShowtime.seats || []).map((seat) => {
                                    const isChosen = selectedSeats.some((s) => s.seatNumber === seat.seatNumber)
                                    const isUnavailable = seat.status === "booked" || seat.status === "reserved" || seat.status === "locked"

                                    let seatClass = "seat-item available"
                                    if (isUnavailable) seatClass = "seat-item booked"
                                    if (isChosen) seatClass = "seat-item selected"

                                    return (
                                        <button
                                            key={seat.seatNumber}
                                            onClick={() => handleSeatClick(seat)}
                                            disabled={isUnavailable}
                                            className={seatClass}
                                            title={`${seat.seatNumber} - ₹${selectedShowtime.ticketPrice || 250}`}
                                        >
                                            {seat.seatNumber}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="seat-legend-bar">
                            <div className="legend-item">
                                <span className="legend-sample available"></span>
                                <span>Available</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-sample selected"></span>
                                <span>Selected</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-sample booked"></span>
                                <span>Booked</span>
                            </div>
                        </div>

                        <div className="booking-checkout-bar">
                            <div className="checkout-summary">
                                <span className="summary-label">Selected Seats:</span>
                                <span className="summary-seats">
                                    {selectedSeats.length > 0
                                        ? selectedSeats.map((s) => s.seatNumber).join(", ")
                                        : "None"}
                                </span>
                                <span className="summary-total">
                                    Total: ₹{selectedSeats.length * (selectedShowtime.ticketPrice || 250)}
                                </span>
                            </div>

                            <button
                                onClick={handleConfirmBooking}
                                disabled={selectedSeats.length === 0 || bookingLoading}
                                className="checkout-confirm-btn"
                            >
                                {bookingLoading
                                    ? "Reserving..."
                                    : `Pay ₹${selectedSeats.length * (selectedShowtime.ticketPrice || 250)}`}
                            </button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}

export default SeatBooking