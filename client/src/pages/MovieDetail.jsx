import React, { useEffect, useState, useMemo } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import Navbar from "../components/NavBar"
import CitySelectorModal from "../components/CitySelectorModal"
import "../assets/styles/movieDetail.css"

export const MovieDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { isAuthenticated } = useSelector((state) => state.auth)
    const { selectedCity, userLocation } = useSelector((state) => state.theatre)

    const [movie, setMovie] = useState(null)
    const [theatres, setTheatres] = useState([])
    const [loading, setLoading] = useState(true)
    const [theatresLoading, setTheatresLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isCityModalOpen, setIsCityModalOpen] = useState(false)

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                setLoading(true)
                setError(null)

                const res = await fetch(`/api/v1/movies/${id}`)
                const data = await res.json()

                if (!res.ok || !data.movie) {
                    throw new Error(data.message || "Failed to load movie details")
                }

                setMovie(data.movie)
            } catch (err) {
                setError(err.message || "Error retrieving movie information")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchMovieDetails()
        }
    }, [id])

    useEffect(() => {
        const fetchCinemasForCity = async () => {
            try {
                setTheatresLoading(true)
                const queryParams = new URLSearchParams({
                    lat: String(userLocation?.lat || 18.9690),
                    lng: String(userLocation?.lng || 72.8194),
                    radius: String(userLocation?.radiusKm || 50),
                    city: selectedCity || "Mumbai"
                })

                const res = await fetch(`/api/v1/theatres/nearby?${queryParams.toString()}`)
                const data = await res.json()

                if (res.ok && Array.isArray(data.theatres)) {
                    setTheatres(data.theatres)
                } else {
                    setTheatres([])
                }
            } catch {
                setTheatres([])
            } finally {
                setTheatresLoading(false)
            }
        }

        fetchCinemasForCity()
    }, [selectedCity, userLocation?.lat, userLocation?.lng, userLocation?.radiusKm])

    const handleBookSeatsNavigation = () => {
        if (!isAuthenticated) {
            navigate("/register")
            return
        }
        navigate(`/seat-booking/${id}`)
    }

    if (loading) {
        return (
            <div className="movie-detail-page">
                <Navbar />
                <div className="movie-detail-loading">
                    <div className="movie-detail-spinner"></div>
                    <p>Loading title details...</p>
                </div>
            </div>
        )
    }

    if (error || !movie) {
        return (
            <div className="movie-detail-page">
                <Navbar />
                <div className="movie-detail-error">
                    <p>{error || "Movie not found"}</p>
                    <button onClick={() => navigate("/")} className="movie-detail-back-btn">
                        Back to Catalog
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="movie-detail-page">
            <CitySelectorModal
                isOpen={isCityModalOpen}
                onClose={() => setIsCityModalOpen(false)}
            />

            <Navbar />

            <div
                className="movie-detail-hero"
                style={{ backgroundImage: `url(${movie.posterUrl})` }}
            >
                <div className="movie-detail-hero-backdrop"></div>
                <div className="movie-detail-hero-content">
                    <div className="movie-detail-poster-wrap">
                        <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="movie-detail-poster"
                        />
                    </div>

                    <div className="movie-detail-meta">
                        <div className="movie-detail-badge-group">
                            <span className="movie-detail-badge rating">★ {movie.rating || "PG-13"}</span>
                            <span className="movie-detail-badge duration">{movie.durationMinutes} mins</span>
                            <span className="movie-detail-badge active-status">Now Showing</span>
                        </div>

                        <h1 className="movie-detail-title">{movie.title}</h1>

                        <div className="movie-detail-genres">
                            {Array.isArray(movie.genre)
                                ? movie.genre.map((g) => (
                                    <span key={g} className="movie-detail-genre-chip">
                                        {g}
                                    </span>
                                ))
                                : movie.genre}
                        </div>

                        <p className="movie-detail-description">{movie.description}</p>

                        <div className="movie-detail-action-row">
                            <button
                                onClick={handleBookSeatsNavigation}
                                className="movie-detail-cta-btn"
                            >
                                Book Seats in {selectedCity}
                            </button>

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
                <section className="movie-detail-venues-section">
                    <div className="movie-detail-venues-header">
                        <div>
                            <h2 className="movie-detail-venues-heading">Physical Venues in {selectedCity}</h2>
                            <span className="movie-detail-venues-subtext">
                                Verified cinema screens within {userLocation?.radiusKm || 50} km
                            </span>
                        </div>
                        <button
                            onClick={() => setIsCityModalOpen(true)}
                            className="movie-detail-switch-city-link"
                        >
                            Select Different City
                        </button>
                    </div>

                    {theatresLoading ? (
                        <div className="movie-detail-venues-loading">Scanning real-world cinemas...</div>
                    ) : theatres.length === 0 ? (
                        <div className="movie-detail-venues-empty">
                            <p>No verified venues found in {selectedCity}.</p>
                            <button onClick={() => setIsCityModalOpen(true)} className="select-city-btn">
                                Switch City
                            </button>
                        </div>
                    ) : (
                        <div className="movie-detail-theatres-grid">
                            {theatres.map((theatre) => (
                                <div key={theatre._id} className="movie-detail-theatre-card">
                                    <div className="theatre-card-top">
                                        <h3 className="theatre-card-name">{theatre.name}</h3>
                                        <span className="theatre-card-distance">
                                            {theatre.distanceKm !== null && theatre.distanceKm !== undefined
                                                ? `${theatre.distanceKm} km`
                                                : theatre.city}
                                        </span>
                                    </div>
                                    <p className="theatre-card-address">{theatre.address}</p>
                                    <div className="theatre-card-bottom">
                                        <span className="theatre-card-screens">
                                            {theatre.screens?.length || 1} Screen{theatre.screens?.length > 1 ? "s" : ""}
                                        </span>
                                        <button
                                            onClick={handleBookSeatsNavigation}
                                            className="theatre-card-select-btn"
                                        >
                                            View Timings
                                        </button>
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