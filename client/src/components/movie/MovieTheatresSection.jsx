import "../../assets/styles/movieDetail.css"

export const MovieTheatresSection = ({
    theatresRef,
    groupedTheatres = [],
    selectedCity,
    onOpenCityModal,
    onSelectSlot
}) => {
    const formatSlotTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    return (
        <section ref={theatresRef} className="movie-detail-section">
            <h2 className="movie-detail-section-title">Theatres & Scheduled Times</h2>

            {groupedTheatres.length === 0 ? (
                <div className="movie-theatres-empty-box">
                    <p>
                        No screening sessions currently scheduled in <strong>{selectedCity}</strong> for this title.
                    </p>
                    <button type="button" onClick={onOpenCityModal}>Select Different City</button>
                </div>
            ) : (
                <div className="movie-theatres-showtimes-wrapper">
                    {groupedTheatres.map(({ theatre, shows = [] }) => (
                        <div key={theatre._id || theatre.name} className="movie-theatre-card-split">
                            <div className="movie-theatre-left-meta">
                                <h3 className="movie-theatre-name">{theatre.name}</h3>
                                <p className="movie-theatre-address">{theatre.address}</p>
                                {theatre.distanceKm !== undefined && theatre.distanceKm !== null && (
                                    <span className="movie-theatre-distance-badge">
                                        📍 {theatre.distanceKm} km away
                                    </span>
                                )}
                            </div>

                            <div className="movie-theatre-right-slots">
                                {shows.map((show) => (
                                    <button
                                        key={show._id}
                                        onClick={() => onSelectSlot(show._id)}
                                        className="movie-slot-chip"
                                    >
                                        <span className="movie-slot-chip-time">
                                            {formatSlotTime(show.startTime)}
                                        </span>
                                        <span className="movie-slot-chip-price">
                                            ₹{show.ticketPrice || 250}
                                        </span>
                                        <span className="movie-slot-chip-screen">
                                            Screen {show.screenNumber || 1}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

export default MovieTheatresSection