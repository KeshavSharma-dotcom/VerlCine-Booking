import React from "react"
import "../../assets/styles/movieDetail.css"

export const MovieAbout = ({ movie }) => {
    const plot =
        movie?.plot ||
        movie?.description ||
        movie?.overview ||
        "Synopsis currently being updated for this feature title."

    return (
        <section className="movie-detail-section">
            <h2 className="movie-detail-section-title">About the Movie</h2>
            <div className="movie-detail-about-card">
                <p className="movie-detail-plot">{plot}</p>
            </div>
        </section>
    )
}

export default MovieAbout