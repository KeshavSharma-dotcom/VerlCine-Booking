import React, { useState, useMemo, useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setSelectedCity, setUserLocation } from "../redux/slices/theatreSlice"
import "../assets/styles/cityModal.css"

const POPULAR_METROS = [
    { name: "Mumbai", state: "Maharashtra", lat: 18.9690, lng: 72.8194 },
    { name: "Delhi-NCR", state: "National Capital Region", lat: 28.6139, lng: 77.2090 },
    { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
    { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 },
    { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
    { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
    { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
    { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 }
]

export const CitySelectorModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch()
    const { cities, selectedCity } = useSelector((state) => state.theatre)
    const [searchTerm, setSearchTerm] = useState("")
    const [detectingLocation, setDetectingLocation] = useState(false)
    const [locationError, setLocationError] = useState(null)
    const searchInputRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            setSearchTerm("")
            setLocationError(null)
            setTimeout(() => {
                searchInputRef.current?.focus()
            }, 100)
        }
    }, [isOpen])

    const mergedCities = useMemo(() => {
        const set = new Set(cities)
        POPULAR_METROS.forEach((m) => set.add(m.name))
        return Array.from(set).sort((a, b) => a.localeCompare(b))
    }, [cities])

    const filteredCities = useMemo(() => {
        const query = searchTerm.trim().toLowerCase()
        if (!query) return mergedCities
        return mergedCities.filter((city) => city.toLowerCase().includes(query))
    }, [mergedCities, searchTerm])

    const handleSelectCity = (cityName) => {
        dispatch(setSelectedCity(cityName))
        const metroData = POPULAR_METROS.find((m) => m.name.toLowerCase() === cityName.toLowerCase())
        if (metroData) {
            dispatch(setUserLocation({ lat: metroData.lat, lng: metroData.lng }))
        }
        onClose()
    }

    const handleDetectCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser")
            return
        }

        setDetectingLocation(true)
        setLocationError(null)

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setDetectingLocation(false)
                dispatch(
                    setUserLocation({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    })
                )
                onClose()
            },
            (err) => {
                setDetectingLocation(false)
                setLocationError(err.message || "Location access denied. Please select your city manually.")
            },
            { timeout: 10000, enableHighAccuracy: false }
        )
    }

    if (!isOpen) return null

    return (
        <div className="city-modal-backdrop" onClick={onClose}>
            <div className="city-modal-container" onClick={(e) => e.stopPropagation()}>
                <header className="city-modal-header">
                    <div className="city-search-input-box">
                        <svg className="city-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search your city (e.g. Mumbai, Jaipur, Bengaluru)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="city-modal-input"
                        />
                        {searchTerm && (
                            <button
                                className="city-modal-clear-btn"
                                onClick={() => setSearchTerm("")}
                                aria-label="Clear input"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <button className="city-modal-close-btn" onClick={onClose} aria-label="Close dialog">
                        ✕
                    </button>
                </header>

                <div className="city-modal-body">
                    <div className="city-detect-bar" onClick={handleDetectCurrentLocation}>
                        <div className="city-detect-icon-box">
                            <svg className="city-detect-crosshair" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="7"></circle>
                                <line x1="12" y1="1" x2="12" y2="5"></line>
                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                <line x1="1" y1="12" x2="5" y2="12"></line>
                                <line x1="19" y1="12" x2="23" y2="12"></line>
                            </svg>
                        </div>
                        <div className="city-detect-text">
                            <h4>Detect my location</h4>
                            <p>{detectingLocation ? "Accessing GPS satellites..." : "Using browser location coordinates"}</p>
                        </div>
                        {detectingLocation && <div className="city-modal-spinner" />}
                    </div>

                    {locationError && (
                        <div className="city-detect-error">{locationError}</div>
                    )}

                    {!searchTerm && (
                        <div className="city-section-group">
                            <span className="city-section-label">Popular Metros</span>
                            <div className="city-popular-grid">
                                {POPULAR_METROS.map((metro) => {
                                    const isSelected = selectedCity.toLowerCase() === metro.name.toLowerCase()
                                    return (
                                        <button
                                            key={metro.name}
                                            onClick={() => handleSelectCity(metro.name)}
                                            className={`city-popular-card ${isSelected ? "active" : ""}`}
                                        >
                                            <span className="city-popular-name">{metro.name}</span>
                                            <span className="city-popular-state">{metro.state}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div className="city-section-group">
                        <span className="city-section-label">
                            {searchTerm ? `Matching Locations (${filteredCities.length})` : "All Regions"}
                        </span>
                        {filteredCities.length === 0 ? (
                            <div className="city-no-results">
                                <p>No operational cinemas match <strong>"{searchTerm}"</strong></p>
                                <span>Try searching for another major city or use auto-detect.</span>
                            </div>
                        ) : (
                            <div className="city-alphabetical-grid">
                                {filteredCities.map((cityName) => {
                                    const isSelected = selectedCity.toLowerCase() === cityName.toLowerCase()
                                    return (
                                        <button
                                            key={cityName}
                                            onClick={() => handleSelectCity(cityName)}
                                            className={`city-pill-btn ${isSelected ? "selected" : ""}`}
                                        >
                                            {cityName}
                                            {isSelected && <span className="city-pill-check">✓</span>}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CitySelectorModal