import React from "react"
import "../../assets/styles/seatBooking.css"

export const BookingMovieHeader = ({ showtime }) => {
    const movie = showtime?.movie || {}
    const theatre = showtime?.theatre || {}

    const timeFormatted = showtime?.startTime
        ? new Date(showtime.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
        : ""

    const dateFormatted = showtime?.startTime
        ? new Date(showtime.startTime).toLocaleDateString([], {
            weekday: "short",
            month: "short",
            day: "numeric"
        })
        : ""

    return (
        <header className="booking-movie-header">
            <div className="booking-poster-box">
                <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="booking-poster-img"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => {
                        e.target.onerror = null
                        e.target.src =
                            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80"
                    }}
                />
            </div>
            <div className="booking-movie-meta">
                <span className="booking-pill-badge">★ {movie.rating || "PG-13"}</span>
                <h1 className="booking-movie-title">{movie.title}</h1>
                <p className="booking-movie-genres">
                    {theatre.name} — Screen {showtime?.screenNumber || 1}
                </p>
                <p className="booking-region-notice">
                    {dateFormatted} at <strong>{timeFormatted}</strong> • ₹{showtime?.ticketPrice || 250} per ticket
                </p>
            </div>
        </header>
    )
}

export default BookingMovieHeader