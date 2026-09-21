import React from "react"

export const HomeFeedControls = ({
    activeTab,
    onTabChange,
    selectedCity,
    onOpenCityModal,
    availableGenres,
    selectedGenre,
    onSelectGenre
}) => {
    return (
        <section className="home-feed-controls">
            <div className="home-feed-header-row">
                <div className="home-tab-pill-group">
                    <button
                        onClick={() => onTabChange("all")}
                        className={`home-feed-tab-btn ${activeTab === "all" ? "active" : ""}`}
                    >
                        All Releases
                    </button>
                    <button
                        onClick={() => onTabChange("movies")}
                        className={`home-feed-tab-btn ${activeTab === "movies" ? "active" : ""}`}
                    >
                        Movies
                    </button>
                    <button
                        onClick={() => onTabChange("shows")}
                        className={`home-feed-tab-btn ${activeTab === "shows" ? "active" : ""}`}
                    >
                        Live Standups & Shows
                    </button>
                </div>

                <button
                    className="home-location-indicator-btn"
                    onClick={onOpenCityModal}
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
                        onClick={() => onSelectGenre(genre)}
                        className={`home-genre-chip ${selectedGenre === genre ? "active" : ""}`}
                    >
                        {genre}
                    </button>
                ))}
            </div>
        </section>
    )
}

export default HomeFeedControls