import React from "react"
import { Link } from "react-router-dom"

export const HomeSpotlightBanner = ({
    featuredSpotlight,
    selectedCity
}) => {
    if (!featuredSpotlight) return null

    return (
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
                        to={`/seat-booking/${featuredSpotlight._id}`}
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
    )
}

export default HomeSpotlightBanner