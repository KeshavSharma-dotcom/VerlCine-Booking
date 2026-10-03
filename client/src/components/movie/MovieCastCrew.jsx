import React from "react"
import "../../assets/styles/movieDetail.css"

export const MovieCastCrew = ({ movie = {} }) => {
    const details = [
        { label: "Director", value: movie.director || movie.Director },
        { label: "Writers", value: movie.writer || movie.writers || movie.Writer },
        { label: "Starring Cast", value: movie.cast },
        { label: "Language", value: movie.language || movie.Language },
    ].filter((item) => Boolean(item.value) && item.value !== "N/A" && item.value !== "")

    if (details.length === 0) {
        return (
            <section className="movie-detail-section">
                <h2 className="movie-detail-section-title">Cast & Crew</h2>
                <div className="movie-detail-about-card">
                    <p style={{ color: "var(--color-text-muted, #94a3b8)", margin: 0 }}>
                        Cast and crew details are not available for this title.
                    </p>
                </div>
            </section>
        )
    }

    return (
        <section className="movie-detail-section">
            <h2 className="movie-detail-section-title">Cast & Crew</h2>
            <div className="movie-detail-crew-grid">
                {details.map((item) => (
                    <div key={item.label} className="movie-detail-crew-card">
                        <span className="movie-detail-crew-label">{item.label}</span>
                        <span className="movie-detail-crew-val">{item.value}</span>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default MovieCastCrew