import React, { useEffect, useMemo } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { fetchMovieById } from "../redux/thunks/movieThunks"
import { clearSelectedMovie } from "../redux/slices/movieSlice"
import "../assets/styles/animatedBg.css"
import "../assets/styles/movieDetail.css"

export const MovieDetail = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { selectedMovie, loading, error } = useSelector((state) => state.movie)
    const { isAuthenticated } = useSelector((state) => state.auth)

    useEffect(() => {
        if (id) {
            dispatch(fetchMovieById(id))
        }
        return () => {
            dispatch(clearSelectedMovie())
        }
    }, [dispatch, id])

    const groupedTheatres = useMemo(() => {
        if (!selectedMovie?.showtimes?.length) return []

        const theatreMap = new Map()

        selectedMovie.showtimes.forEach((slot) => {
            const theatre = slot.theatre
            if (!theatre) return

            const theatreId = theatre._id.toString()
            if (!theatreMap.has(theatreId)) {
                theatreMap.set(theatreId, {
                    theatre,
                    slots: []
                })
            }
            theatreMap.get(theatreId).slots.push(slot)
        })

        return Array.from(theatreMap.values())
    }, [selectedMovie])

    const formatSlotTime = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    if (loading) {
        return (
            <div className="movie-detail-container">
                <div className="home-loading-state" style={{ margin: "auto" }}>
                    <div className="home-spinner"></div>
                    <p>Loading session information...</p>
                </div>
            </div>
        )
    }

    if (error || !selectedMovie) {
        return (
            <div className="movie-detail-container">
                <div className="home-error-state" style={{ margin: "auto" }}>
                    <p>{error || "Title details could not be retrieved"}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="home-spotlight-book-btn"
                        style={{ marginTop: "1rem" }}
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="movie-detail-container">
            <div className="detail-animated-bg-viewport">
                <div
                    className="detail-animated-pan"
                    style={{ backgroundImage: `url(${selectedMovie.posterUrl})` }}
                />
                <div className="detail-animated-overlay" />
            </div>

            <div className="movie-detail-backdrop">
                <div className="movie-detail-backdrop-overlay"></div>
                <div className="movie-detail-hero-content">
                    <div className="movie-detail-poster-wrap">
                        <img
                            src={selectedMovie.posterUrl}
                            alt={selectedMovie.title}
                            className="movie-detail-poster"
                        />
                    </div>
                    <div className="movie-detail-info">
                        <div className="movie-detail-badge-group">
                            <span className="movie-detail-rating-pill">{selectedMovie.rating}</span>
                            <span className="movie-detail-duration">{selectedMovie.durationMinutes} mins</span>
                        </div>
                        <h1 className="movie-detail-title">{selectedMovie.title}</h1>
                        <div className="movie-detail-genre-list">
                            {selectedMovie.genre?.map((g) => (
                                <span key={g} className="movie-detail-genre-tag">{g}</span>
                            ))}
                        </div>
                        <p className="movie-detail-description">{selectedMovie.description}</p>
                    </div>
                </div>
            </div>

            <main className="movie-detail-body">
                <div className="movie-detail-section-header">
                    <h2 className="movie-detail-section-title">Select Theatre & Showtime</h2>
                </div>

                {groupedTheatres.length === 0 ? (
                    <div className="movie-detail-empty-slots">
                        <p>No active sessions or stages scheduled for this title at the moment.</p>
                    </div>
                ) : (
                    <div className="movie-detail-theatres-list">
                        {groupedTheatres.map(({ theatre, slots }) => (
                            <div key={theatre._id} className="movie-detail-theatre-card">
                                <div className="movie-detail-theatre-meta">
                                    <div>
                                        <h3 className="movie-detail-theatre-name">{theatre.name}</h3>
                                        <p className="movie-detail-theatre-address">{theatre.address}</p>
                                    </div>
                                </div>
                                <div className="movie-detail-slots-grid">
                                    {slots.map((slot) => (
                                        <Link
                                            key={slot._id}
                                            to={isAuthenticated ? `/booking/${slot._id}` : "/login"}
                                            className="movie-detail-slot-btn"
                                        >
                                            <span className="movie-detail-slot-time">{formatSlotTime(slot.startTime)}</span>
                                            <span className="movie-detail-slot-price">₹{slot.ticketPrice}</span>
                                            <span className="movie-detail-slot-screen">Screen {slot.screenNumber}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <footer className="home-footer">
                <p>&copy; {new Date().getFullYear()} CineVerl Inc. Jaipur, Rajasthan. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default MovieDetail