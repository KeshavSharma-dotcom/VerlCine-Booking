import React from "react"
import "../../assets/styles/movieDetail.css"

export const MovieCastCrew = ({ movie = {} }) => {
    const castList = Array.isArray(movie.cast)
        ? movie.cast.join(", ")
        : movie.cast || movie.actors || "Cast details arriving soon"

    const details = [
        { label: "Director", value: movie.director },
        { label: "Writers", value: movie.writer || movie.writers },
        { label: "Starring Cast", value: castList },
        { label: "Language", value: movie.language },
        { label: "Box Office", value: movie.boxOffice },
        { label: "Awards & Recognition", value: movie.awards && movie.awards !== "N/A" ? movie.awards : null }
    ].filter((item) => Boolean(item.value))

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