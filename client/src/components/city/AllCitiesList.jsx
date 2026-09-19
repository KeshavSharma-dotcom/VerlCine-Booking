import React from "react"

export const AllCitiesList = ({
    searchResults,
    searchQuery,
    activeLetter,
    groupedCities,
    selectedCity,
    onSelectCity
}) => {
    if (searchResults) {
        return (
            <div className="city-search-results">
                <h3 className="city-section-title">Matching Cities ({searchResults.length})</h3>
                {searchResults.length === 0 ? (
                    <p className="city-no-match">No cities found matching "{searchQuery}"</p>
                ) : (
                    <div className="city-alpha-grid">
                        {searchResults.map((item) => (
                            <button
                                key={item.name}
                                className={`city-name-btn ${selectedCity === item.name ? "active" : ""}`}
                                onClick={() => onSelectCity(item.name, item.lat, item.lng)}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    const activeGroup = groupedCities[activeLetter] || []

    return (
        <div className="city-alpha-grid">
            {activeGroup.length === 0 ? (
                <p className="city-no-match">No cities available for letter '{activeLetter}'</p>
            ) : (
                activeGroup.map((cityObj) => (
                    <button
                        key={cityObj.name}
                        className={`city-name-btn ${selectedCity === cityObj.name ? "active" : ""}`}
                        onClick={() => onSelectCity(cityObj.name, cityObj.lat, cityObj.lng)}
                    >
                        {cityObj.name}
                    </button>
                ))
            )}
        </div>
    )
}

export default AllCitiesList