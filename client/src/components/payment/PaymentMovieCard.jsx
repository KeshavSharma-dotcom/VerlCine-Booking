import React from "react"

export const PaymentMovieCard = ({ booking }) => {
    const movie = booking?.movie || {}
    const showtime = booking?.showtime || {}
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
        <section className="payment-summary-card">
            <div className="payment-poster-box">
                <img
                    src={movie.posterUrl}
                    alt={movie.title || "Movie poster"}
                    className="payment-poster-img"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80"
                    }}
                />
            </div>
            <div className="payment-movie-meta">
                <div className="payment-badge-group">
                    <span className="payment-badge-rating">★ {movie.rating || "PG-13"}</span>
                    <span className="payment-badge-screen">Screen {showtime.screenNumber || 1}</span>
                </div>
                <h2 className="payment-movie-title">{movie.title}</h2>
                <p className="payment-theatre-name">{theatre.name || "Cinema Hall"}</p>
                <p className="payment-theatre-address">{theatre.address || theatre.city || ""}</p>
                <div className="payment-datetime-tag">
                    <span>📅 {dateFormatted}</span>
                    <span>⏰ {timeFormatted}</span>
                </div>
            </div>
        </section>
    )
}

export default PaymentMovieCard