import React, { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { fetchMovies } from "../redux/thunks/movieThunks"
import { fetchNearbyTheatres, fetchTheatreCities } from "../redux/thunks/theatreThunks"
import Navbar from "../components/NavBar"
import CitySelectorModal from "../components/city/city"
import "../assets/styles/animatedBg.css"
import "../assets/styles/home.css"

export const Home = () => {
    const dispatch = useDispatch()
    const { isAuthenticated } = useSelector((state) => state.auth)
    const { movies, loading: moviesLoading, error: moviesError } = useSelector((state) => state.movie)
    const { selectedCity, userLocation } = useSelector((state) => state.theatre)

    const [activeTab, setActiveTab] = useState("all")
    const [selectedGenre, setSelectedGenre] = useState("All")
    const [isCityModalOpen, setIsCityModalOpen] = useState(false)

    useEffect(() => {
        dispatch(fetchMovies({ limit: 50 }))
        dispatch(fetchTheatreCities())
    }, [dispatch])

    useEffect(() => {
        dispatch(
            fetchNearbyTheatres({
                lat: userLocation?.lat || 18.9690,
                lng: userLocation?.lng || 72.8194,
                radius: userLocation?.radiusKm || 50,
                city: selectedCity || "Mumbai"
            })
        )
    }, [dispatch, selectedCity, userLocation?.lat, userLocation?.lng, userLocation?.radiusKm])

    const isLiveEvent = (item) => {
        return item.genre?.some((g) =>
            ["Standup Comedy", "Live Show", "Music Concert", "Theatre Play"].includes(g)
        )
    }

    const featuredSpotlight = useMemo(() => {
        if (!movies || movies.length === 0) return null
        return movies.find((m) => m.rating === "PG-13" && m.posterUrl) || movies[0]
    }, [movies])

    const quadPosters = useMemo(() => {
        const valid = movies.filter((m) => m.posterUrl).map((m) => m.posterUrl)
        if (valid.length === 0) {
            return [
                "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80"
            ]
        }
        return [
            valid[0] || valid[0],
            valid[1] || valid[0],
            valid[2] || valid[0],
            valid[3] || valid[0]
        ]
    }, [movies])

    const availableGenres = useMemo(() => {
        const set = new Set()
        movies.forEach((item) => {
            const isLive = isLiveEvent(item)
            if (activeTab === "movies" && isLive) return
            if (activeTab === "shows" && !isLive) return
            item.genre?.forEach((g) => set.add(g))
        })
        return ["All", ...Array.from(set)]
    }, [movies, activeTab])

    const filteredCatalog = useMemo(() => {
        return movies.filter((item) => {
            const isLive = isLiveEvent(item)
            if (activeTab === "movies" && isLive) return false
            if (activeTab === "shows" && !isLive) return false
            if (selectedGenre !== "All" && !item.genre?.includes(selectedGenre)) return false
            return true
        })
    }, [movies, activeTab, selectedGenre])

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setSelectedGenre("All")
    }

    return (
        <div className="home-container">
            <CitySelectorModal
                isOpen={isCityModalOpen}
                onClose={() => setIsCityModalOpen(false)}
            />

            <div className="animated-bg-viewport">
                <div className="animated-quad-canvas">
                    {quadPosters.map((url, idx) => (
                        <div key={idx} className="animated-quad-tile">
                            <img src={url} alt="" className="animated-quad-img" />
                        </div>
                    ))}
                </div>
                <div className="animated-bg-overlay" />
            </div>

            <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

            <main className="home-content-wrap">
                {featuredSpotlight && (
                    <section className="home-spotlight-banner">
                        <div
                            className="home-spotlight-backdrop"
                            style={{ backgroundImage: `url(${featuredSpotlight.posterUrl})` }}
                        />
                        <div className="home-spotlight-gradient-overlay" />
                        <div className="home-spotlight-info">
                            <div className="home-spotlight-tag">
                                <span className="home-spotlight-pill">Featured Tonight</span>
                                <span className="home-spotlight-rating">★ {featuredSpotlight.rating}</span>
                                <span className="home-spotlight-time">{featuredSpotlight.durationMinutes} mins</span>
                            </div>
                            <h1 className="home-spotlight-title">{featuredSpotlight.title}</h1>
                            <p className="home-spotlight-desc">{featuredSpotlight.description}</p>
                            <div className="home-spotlight-actions">
                                <Link
                                    to={isAuthenticated ? `/seat-booking/${featuredSpotlight._id}` : "/register"}
                                    className="home-spotlight-book-btn"
                                >
                                    Book Seats
                                </Link>
                                <span className="home-spotlight-city-tag">
                                    Now Playing in {selectedCity}
                                </span>
                            </div>
                        </div>
                    </section>
                )}

                <section className="home-feed-controls">
                    <div className="home-feed-header-row">
                        <div className="home-tab-pill-group">
                            <button
                                onClick={() => handleTabChange("all")}
                                className={`home-feed-tab-btn ${activeTab === "all" ? "active" : ""}`}
                            >
                                All Releases
                            </button>
                            <button
                                onClick={() => handleTabChange("movies")}
                                className={`home-feed-tab-btn ${activeTab === "movies" ? "active" : ""}`}
                            >
                                Movies
                            </button>
                            <button
                                onClick={() => handleTabChange("shows")}
                                className={`home-feed-tab-btn ${activeTab === "shows" ? "active" : ""}`}
                            >
                                Live Standups & Shows
                            </button>
                        </div>

                        <button
                            className="home-location-indicator-btn"
                            onClick={() => setIsCityModalOpen(true)}
                        >
                            <span className="home-pin-icon">📍</span>
                            <span>{selectedCity}</span>
                            <span className="home-change-badge">Change</span>
                        </button>
                    </div>

                    <div className="home-genre-scroll-bar">
                        {availableGenres.map((genre) => (
                            <button
                                key={genre}
                                onClick={() => setSelectedGenre(genre)}
                                className={`home-genre-chip ${selectedGenre === genre ? "active" : ""}`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="home-catalog-section">
                    {moviesLoading ? (
                        <div className="home-loading-state">
                            <div className="home-spinner"></div>
                            <p>Loading titles in {selectedCity}...</p>
                        </div>
                    ) : moviesError ? (
                        <div className="home-error-state">
                            <p>{moviesError}</p>
                        </div>
                    ) : filteredCatalog.length === 0 ? (
                        <div className="home-empty-state">
                            <p>No titles currently available matching this category filter.</p>
                        </div>
                    ) : (
                        <div className="home-movies-grid">
                            {filteredCatalog.map((item) => (
                                <Link
                                    key={item._id}
                                    to={isAuthenticated ? `/seat-booking/${item._id}` : "/register"}
                                    className="home-movie-card"
                                >
                                    <div className="home-movie-img-container">
                                        <img
                                            src={item.posterUrl}
                                            alt={item.title}
                                            className="home-movie-img"
                                            loading="lazy"
                                        />
                                        <span className="home-movie-rating-badge">{item.rating}</span>
                                        <div className="home-card-hover-overlay">
                                            <span className="home-card-quick-book">Select Seats</span>
                                        </div>
                                    </div>
                                    <div className="home-movie-content">
                                        <span className="home-movie-genre">
                                            {Array.isArray(item.genre) ? item.genre.slice(0, 2).join(" • ") : item.genre}
                                        </span>
                                        <h3 className="home-movie-title">{item.title}</h3>
                                        <div className="home-movie-footer">
                                            <span className="home-movie-duration">{item.durationMinutes}m</span>
                                            <span className="home-movie-view-link">View Showtimes</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <footer className="home-footer">
                <p>&copy; {new Date().getFullYear()} CineVerl Inc. {selectedCity}. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default Home