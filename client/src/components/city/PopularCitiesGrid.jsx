import React from "react"
import { CITY_ICONS } from "./CityIcons"

const POPULAR_METROS = [
    { name: "Delhi NCR", lat: 28.6139, lng: 77.2090 },
    { name: "Mumbai", lat: 18.9690, lng: 72.8194 },
    { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
    { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
    { name: "Chandigarh", lat: 30.7333, lng: 76.7794 },
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
    { name: "Pune", lat: 18.5204, lng: 73.8567 },
    { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
    { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
    { name: "Goa", lat: 15.2993, lng: 74.1240 },
    { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
    { name: "Abu Dhabi", lat: 24.4539, lng: 54.3773 }
]

export const PopularCitiesGrid = ({ selectedCity, onSelectCity }) => {
    return (
        <div className="city-popular-section">
            <h3 className="city-section-title">Popular Cities</h3>
            <div className="city-popular-grid">
                {POPULAR_METROS.map((c) => {
                    const isSelected = selectedCity?.trim().toLowerCase() === c.name.toLowerCase()
                    return (
                        <button
                            key={c.name}
                            type="button"
                            className={`city-popular-card ${isSelected ? "selected" : ""}`}
                            onClick={() => onSelectCity(c.name, c.lat, c.lng)}
                        >
                            <div className="city-popular-icon-box">
                                {CITY_ICONS[c.name] || (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="landmark-svg">
                                        <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6a3 3 0 0 1 6 0v6" />
                                    </svg>
                                )}
                            </div>
                            <span className="city-popular-name">{c.name}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default PopularCitiesGrid