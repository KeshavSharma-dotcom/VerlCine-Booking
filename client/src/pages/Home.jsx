import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { fetchMovies } from "../redux/thunks/movieThunks"
import Navbar from "../components/NavBar"
import "../assets/styles/home.css"

export const Home = () => {
    const dispatch = useDispatch()
    const { isAuthenticated } = useSelector((state) => state.auth)
    const { movies, loading, error } = useSelector((state) => state.movie)
    const [activeTab, setActiveTab] = useState("all")

    useEffect(() => {
        dispatch(fetchMovies({ limit: 40 }))
    }, [dispatch])

    const filteredCatalog = movies.filter((item) => {
        const isLiveShow = item.genre?.some((g) =>
            ["Standup Comedy", "Live Show", "Music Concert", "Theatre Play"].includes(g)
        )
        if (activeTab === "movies") return !isLiveShow
        if (activeTab === "shows") return isLiveShow
        return true
    })

    return (
        <div className="home-container">
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

            <section className="home-hero-section">
                <div className="home-hero-glow-1"></div>
                <div className="home-hero-glow-2"></div>

                <span className="home-badge">Cinematic Experience Redefined</span>

                <h1 className="home-hero-title">
                    Book Your Favorite Movies <br />
                    <span className="home-title-gradient">Without the Hassle</span>
                </h1>

                <p className="home-hero-desc">
                    Explore blockbusters, reserve the best seats in the house across Jaipur, and dive into an unforgettable entertainment journey with CineVerl.
                </p>

                <div className="home-hero-buttons">
                    <a href="#catalog" className="home-btn-explore" onClick={() => setActiveTab("movies")}>
                        Explore Movies Now
                    </a>
                    <a href="#catalog" className="home-btn-shows" onClick={() => setActiveTab("shows")}>
                        Live Shows & Standups
                    </a>
                    {!isAuthenticated && (
                        <Link to="/login" className="home-btn-signin">
                            Sign In to Account
                        </Link>
                    )}
                </div>
            </section>

            <section id="catalog" className="home-trending-section">
                <div className="home-trending-header">
                    <div>
                        <h2 className="home-section-title">
                            {activeTab === "shows" ? "Live Stages & Standups" : activeTab === "movies" ? "Movies in Theatres" : "Trending in Jaipur"}
                        </h2>
                        <p className="home-section-subtitle">
                            Live schedules for Raj Mandir, INOX Crystal Palm, JKK, and Birla Auditorium.
                        </p>
                    </div>
                    <div className="home-filter-tabs">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`home-tab-btn ${activeTab === "all" ? "active" : ""}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveTab("movies")}
                            className={`home-tab-btn ${activeTab === "movies" ? "active" : ""}`}
                        >
                            Movies
                        </button>
                        <button
                            onClick={() => setActiveTab("shows")}
                            className={`home-tab-btn ${activeTab === "shows" ? "active" : ""}`}
                        >
                            Live Shows
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="home-loading-state">
                        <div className="home-spinner"></div>
                        <p>Loading scheduled sessions...</p>
                    </div>
                ) : error ? (
                    <div className="home-error-state">
                        <p>{error}</p>
                    </div>
                ) : filteredCatalog.length === 0 ? (
                    <div className="home-empty-state">
                        <p>No shows found for this selection.</p>
                    </div>
                ) : (
                    <div className="home-movies-grid">
                        {filteredCatalog.map((item) => (
                            <div key={item._id} className="home-movie-card">
                                <div className="home-movie-img-container">
                                    <img src={item.posterUrl} alt={item.title} className="home-movie-img" loading="lazy" />
                                    <span className="home-movie-rating">{item.rating}</span>
                                </div>
                                <div className="home-movie-content">
                                    <span className="home-movie-genre">{Array.isArray(item.genre) ? item.genre.join(" • ") : item.genre}</span>
                                    <h3 className="home-movie-title">{item.title}</h3>
                                    <div className="home-movie-footer">
                                        <span className="home-movie-duration">{item.durationMinutes} mins</span>
                                        <Link
                                            to={isAuthenticated ? `/movie/${item._id}` : "/register"}
                                            className="home-movie-btn"
                                        >
                                            Book Seats
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <footer className="home-footer">
                <p>&copy; {new Date().getFullYear()} CineVerl Inc. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default Home