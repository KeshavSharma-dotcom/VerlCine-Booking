import React, { useEffect, useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import CitySelectorModal from "../components/city/city"
import "../assets/styles/movieDetail.css"

export const MovieDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const { selectedCity, userLocation } = useSelector((state) => state.theatre)

    const [movie, setMovie] = useState(null)
    const [showtimes, setShowtimes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isCityModalOpen, setIsCityModalOpen] = useState(false)

    useEffect(() => {
        const fetchDetailsAndShowtimes = async () => {
            try {
                setLoading(true)
                setError(null)

                // 1. Fetch movie metadata from backend / OMDb
                let movieRes = await fetch(`/api/v1/movies/${id}`)
                if (!movieRes.ok) movieRes = await fetch(`/api/movies/${id}`)
                const movieData = await movieRes.json()
                const resolvedMovie = movieData.movie || movieData.data || movieData
                setMovie(resolvedMovie)

                // 2. Fetch showtimes with city & distance coordinates
                const lat = userLocation?.lat || ""
                const lng = userLocation?.lng || ""
                const cityParam = encodeURIComponent(selectedCity || "Mumbai")

                let showRes = await fetch(
                    `/api/v1/showtimes?movieId=${id}&city=${cityParam}&lat=${lat}&lng=${lng}`
                )
                if (!showRes.ok) {
                    showRes = await fetch(
                        `/api/showtimes?movieId=${id}&city=${cityParam}&lat=${lat}&lng=${lng}`
                    )
                }
                const showData = await showRes.json()
                const list = showData.showtimes || showData.data || (Array.isArray(showData) ? showData : [])
                setShowtimes(Array.isArray(list) ? list : [])
            } catch (err) {
                setError(err.message || "Failed to load movie")
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchDetailsAndShowtimes()
    }, [id, selectedCity, userLocation?.lat, userLocation?.lng])

    // Group showtimes by physical theatre and sort by distance
    const groupedTheatres = useMemo(() => {
        const map = new Map()
        showtimes.forEach((st) => {
            const theatreObj = typeof st.theatre === "object" ? st.theatre : null
            const theatreId = theatreObj?._id || st.theatre || "venue"

            if (!map.has(theatreId)) {
                map.set(theatreId, {
                    theatre: theatreObj || { name: "Cinema Hall", address: selectedCity },
                    shows: []
                })
            }
            map.get(theatreId).shows.push(st)
        })

        return Array.from(map.values()).sort((a, b) => {
            const distA = a.theatre.distanceKm ?? 9999
            const distB = b.theatre.distanceKm ?? 9999
            return distA - distB
        })
    }, [showtimes, selectedCity])

    const handleSelectShowtime = (showtimeId) => {
        navigate(`/seat-booking/${showtimeId}`)
    }

    if (loading) {
        return (
            <div className="movie-detail-page">
                <div className="movie-detail-loading">
                    <div className="movie-detail-spinner"></div>
                    <p>Loading full movie details & screening showtimes...</p>
                </div>
            </div>
        )
    }

    if (error || !movie) {
        return (
            <div className="movie-detail-page">
                <div className="movie-detail-error">
                    <p>{error || "Movie not found"}</p>
                    <button onClick={() => navigate("/")} className="movie-detail-back-btn">
                        Back to Catalog
                    </button>
                </div>
            </div>
        )
    }

    const castList = Array.isArray(movie.cast)
        ? movie.cast
        : typeof movie.cast === "string"
            ? movie.cast.split(",").map((s) => s.trim())
            : []

    const genreList = Array.isArray(movie.genre)
        ? movie.genre
        : typeof movie.genre === "string"
            ? movie.genre.split(",").map((g) => g.trim())
            : []

    return (
        <div className="movie-detail-page">
            <CitySelectorModal
                isOpen={isCityModalOpen}
                onClose={() => setIsCityModalOpen(false)}
            />

            <div
                className="movie-detail-hero"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(7, 11, 20, 0.96) 20%, rgba(7, 11, 20, 0.85) 60%, rgba(7, 11, 20, 0.45) 100%), url(${movie.posterUrl})`
                }}
            >
                <div className="movie-detail-hero-content">
                    <div className="movie-detail-poster-wrap">
                        <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            onError={(e) => {
                                e.target.onerror = null
                                e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80"
                            }}
                            className="movie-detail-poster"
                        />
                    </div>

                    <div className="movie-detail-meta">
                        <div className="movie-detail-badge-group">
                            <span className="movie-detail-badge rating">★ {movie.imdbRating || movie.rating || "PG-13"}</span>
                            <span className="movie-detail-badge duration">{movie.durationMinutes || 120} mins</span>
                            {movie.releasedYear && <span className="movie-detail-badge year">{movie.releasedYear}</span>}
                            <span className="movie-detail-badge active-status">Now Screening</span>
                        </div>

                        <h1 className="movie-detail-title">{movie.title}</h1>

                        <div className="movie-detail-genres">
                            {genreList.map((g) => (
                                <span key={g} className="movie-detail-genre-chip">
                                    {g}
                                </span>
                            ))}
                        </div>

                        <p className="movie-detail-description">{movie.plot || movie.description}</p>

                        <div className="movie-detail-action-row">
                            <a href="#showtimes-section" className="movie-detail-cta-btn">
                                View Theatres & Showtimes
                            </a>
                            <button
                                onClick={() => setIsCityModalOpen(true)}
                                className="movie-detail-location-btn"
                            >
                                <span className="loc-pin">📍</span>
                                <span>{selectedCity}</span>
                                <span className="loc-change">Change</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="movie-detail-main">
                <section className="omdb-info-grid">
                    <div className="omdb-info-card">
                        <h3 className="omdb-section-heading">Cast & Crew</h3>
                        <div className="omdb-key-val-list">
                            {movie.director && (
                                <div className="omdb-key-val-item">
                                    <span className="key-label">Director</span>
                                    <span className="key-value">{movie.director}</span>
                                </div>
                            )}
                            {movie.writer && (
                                <div className="omdb-key-val-item">
                                    <span className="key-label">Writer(s)</span>
                                    <span className="key-value">{movie.writer}</span>
                                </div>
                            )}
                            {castList.length > 0 && (
                                <div className="omdb-key-val-item">
                                    <span className="key-label">Starring</span>
                                    <span className="key-value">{castList.join(", ")}</span>
                                </div>
                            )}
                            {movie.language && (
                                <div className="omdb-key-val-item">
                                    <span className="key-label">Language</span>
                                    <span className="key-value">{movie.language}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="omdb-info-card">
                        <h3 className="omdb-section-heading">Box Office & Acclaim</h3>
                        <div className="omdb-key-val-list">
                            {movie.boxOffice && (
                                <div className="omdb-key-val-item">
                                    <span className="key-label">Box Office</span>
                                    <span className="key-value">{movie.boxOffice}</span>
                                </div>
                            )}
                            {movie.metascore && (
                                <div className="omdb-key-val-item">
                                    <span className="key-label">Metascore</span>
                                    <span className="key-value metascore-badge">{movie.metascore} / 100</span>
                                </div>
                            )}
                            {movie.awards && movie.awards !== "N/A" && (
                                <div className="omdb-key-val-item">
                                    <span className="key-label">Awards</span>
                                    <span className="key-value awards-text">{movie.awards}</span>
                                </div>
                            )}
                        </div>

                        {Array.isArray(movie.ratings) && movie.ratings.length > 0 && (
                            <div className="omdb-ratings-row">
                                {movie.ratings.map((r) => (
                                    <div key={r.Source} className="critic-rating-pill">
                                        <span className="rating-source">{r.Source}</span>
                                        <span className="rating-score">{r.Value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section id="showtimes-section" className="movie-detail-venues-section">
                    <div className="movie-detail-venues-header">
                        <div>
                            <h2 className="movie-detail-venues-heading">Select Cinema & Show Time in {selectedCity}</h2>
                            <span className="movie-detail-venues-subtext">
                                Theatres sorted by proximity to your chosen location
                            </span>
                        </div>
                        <button
                            onClick={() => setIsCityModalOpen(true)}
                            className="movie-detail-switch-city-link"
                        >
                            Change Region
                        </button>
                    </div>

                    {groupedTheatres.length === 0 ? (
                        <div className="movie-detail-venues-empty">
                            <p>No screening sessions found in <strong>{selectedCity}</strong> for this movie.</p>
                            <button onClick={() => setIsCityModalOpen(true)} className="select-city-btn">
                                Select Different City
                            </button>
                        </div>
                    ) : (
                        <div className="movie-detail-theatres-grid">
                            {groupedTheatres.map(({ theatre, shows }) => (
                                <div key={theatre._id || Math.random()} className="movie-detail-theatre-card">
                                    <div className="theatre-card-top">
                                        <h3 className="theatre-card-name">{theatre.name}</h3>
                                        {theatre.distanceKm !== undefined && (
                                            <span className="theatre-card-distance">
                                                📍 {theatre.distanceKm} km away
                                            </span>
                                        )}
                                    </div>
                                    <p className="theatre-card-address">{theatre.address}</p>

                                    <div className="theatre-card-shows-container">
                                        <span className="theatre-card-shows-label">Select Showtime:</span>
                                        <div className="theatre-card-shows-grid">
                                            {shows.map((show) => {
                                                const time = new Date(show.startTime).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })
                                                return (
                                                    <button
                                                        key={show._id}
                                                        onClick={() => handleSelectShowtime(show._id)}
                                                        className="theatre-card-slot-btn"
                                                    >
                                                        <span className="slot-btn-time">{time}</span>
                                                        <span className="slot-btn-price">₹{show.ticketPrice || 250}</span>
                                                        <span className="slot-btn-screen">Screen {show.screenNumber || 1}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <footer className="movie-detail-footer">
                <p>&copy; {new Date().getFullYear()} CineVerl Inc. {selectedCity}. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default MovieDetail