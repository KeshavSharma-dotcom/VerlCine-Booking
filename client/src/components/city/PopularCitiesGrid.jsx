import React from "react"

export const PopularCitiesGrid = ({ popularCities, selectedCity, onSelectCity }) => {
    if (!popularCities || popularCities.length === 0) return null

    return (
        <div className="city-popular-section">
            <h3 className="city-section-title">Popular Cities</h3>
            <div className="city-popular-grid">
                {popularCities.map((c) => {
                    const isSelected = selectedCity?.toLowerCase() === c.name.toLowerCase()
                    return (
                        <button
                            key={c.name}
                            className={`city-popular-card ${isSelected ? "selected" : ""}`}
                            onClick={() => onSelectCity(c.name, c.lat, c.lng)}
                        >
                            <div
                                className="city-popular-icon-box"
                                dangerouslySetInnerHTML={{ __html: c.iconSvg }}
                            />
                            <span className="city-popular-name">{c.name}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default PopularCitiesGrid