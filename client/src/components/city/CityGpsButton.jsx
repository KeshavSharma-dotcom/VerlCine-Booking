import React from "react"

export const CityGpsButton = ({ geoLoading, onDetectLocation }) => {
    return (
        <div className="city-gps-row" onClick={onDetectLocation}>
            <svg
                className={`city-gps-icon ${geoLoading ? "spin" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
            >
                <circle cx="12" cy="12" r="8" strokeWidth="2" />
                <line x1="12" y1="2" x2="12" y2="6" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="18" x2="12" y2="22" strokeWidth="2" strokeLinecap="round" />
                <line x1="2" y1="12" x2="6" y2="12" strokeWidth="2" strokeLinecap="round" />
                <line x1="18" y1="12" x2="22" y2="12" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
            <span className="city-gps-text">
                {geoLoading ? "Detecting exact location..." : "Use Current Location"}
            </span>
        </div>
    )
}

export default CityGpsButton