import React from "react"
import { Link } from "react-router-dom"

export const HomeCatalogGrid = ({
    loading,
    error,
    filteredCatalog,
    selectedCity,
    isAuthenticated
}) => {
    if (loading) {
        return (
            <section className="home-catalog-section">
                <div className="home-loading-state">
                    <div className="home-spinner"></div>
                    <p>Loading titles in {selectedCity}...</p>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="home-catalog-section">
                <div className="home-error-state">
                    <p>{error}</p>
                </div>
            </section>
        )
    }

    if (filteredCatalog.length === 0) {
        return (
            <section className="home-catalog-section">
                <div className="home-empty-state">
                    <p>No titles currently available matching this category filter.</p>
                </div>
            </section>
        )
    }

    return (
        <section className="home-catalog-section">
            <div className="home-movies-grid">
                {filteredCatalog.map((item) => (
                    <Link
                        key={item._id}
                        to={isAuthenticated ? `/movie/${item._id}` : "/register"}
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
        </section>
    )
}

export default HomeCatalogGrid