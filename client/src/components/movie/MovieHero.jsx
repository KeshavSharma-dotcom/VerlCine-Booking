import "../../assets/styles/movieDetail.css"

export const MovieHero = ({
    movie,
    selectedCity,
    onOpenCityModal,
    onBookSeatsClick
}) => {
    const genreList = Array.isArray(movie.genre)
        ? movie.genre
        : typeof movie.genre === "string"
            ? movie.genre.split(",").map((g) => g.trim())
            : []

    return (
        <div
            className="movie-detail-backdrop"
            style={{ backgroundImage: `url(${movie.posterUrl})` }}
        >
            <div className="movie-detail-backdrop-overlay" />
            <div className="movie-detail-hero-content">
                <div className="movie-detail-poster-wrap">
                    <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="movie-detail-poster"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                    />
                </div>

                <div className="movie-detail-info">
                    <div className="movie-detail-badge-group">
                        <span className="movie-detail-rating-pill">
                            ★ {movie.imdbRating || movie.rating || "PG-13"}
                        </span>
                        <span className="movie-detail-duration">
                            {movie.durationMinutes || 120} mins
                        </span>
                        {movie.releasedYear && (
                            <span className="movie-detail-year">{movie.releasedYear}</span>
                        )}
                    </div>

                    <h1 className="movie-detail-title">{movie.title}</h1>

                    <div className="movie-detail-genre-list">
                        {genreList.map((g) => (
                            <span key={g} className="movie-detail-genre-tag">
                                {g}
                            </span>
                        ))}
                    </div>

                    <div className="movie-detail-actions">
                        <button
                            onClick={onBookSeatsClick}
                            className="movie-detail-book-cta"
                        >
                            Book Seats
                        </button>

                        <button
                            onClick={onOpenCityModal}
                            className="movie-detail-city-trigger"
                        >
                            <span>📍</span>
                            <span>
                                City: <strong className="movie-detail-city-tag">{selectedCity}</strong>
                            </span>
                            <span className="movie-detail-city-change-btn">Change</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MovieHero