import React from "react"

export const CitySearchBox = ({ searchQuery, setSearchQuery }) => {
    return (
        <div className="city-search-box">
            <svg className="city-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
                type="text"
                className="city-search-input"
                placeholder="Search city, area or locality"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
            />
            {searchQuery && (
                <button
                    className="city-search-clear"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                >
                    &times;
                </button>
            )}
        </div>
    )
}

export default CitySearchBox