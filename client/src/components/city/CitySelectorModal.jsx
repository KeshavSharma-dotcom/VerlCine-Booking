import React, { useState, useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setCitySelection } from "../../redux/slices/citySlice"
import { fetchAlphabets, fetchPopularCities, fetchAllCities } from "../../redux/thunks/cityThunks"
import { fetchNearbyTheatres } from "../../redux/thunks/theatreThunks"
import { fetchMovies } from "../../redux/thunks/movieThunks"
import { DEFAULT_APP_LOCATION } from "../../utils/locationStorage"
import { CitySearchBox } from "./CitySearchBox"
import { CityGpsButton } from "./CityGpsButton"
import { PopularCitiesGrid } from "./PopularCitiesGrid"
import { AlphabetFilterBar } from "./AlphabetFilterBar"
import { AllCitiesList } from "./AllCitiesList"
import "../../assets/styles/citySelectorModal.css"

export default function CitySelectorModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const { selectedCity, alphabets, popularCities, groupedCities, allCities } = useSelector(
    (state) => state.city
  )

  const [searchQuery, setSearchQuery] = useState("")
  const [activeLetter, setActiveLetter] = useState("A")
  const [geoLoading, setGeoLoading] = useState(false)

  useEffect(() => {
    if (isOpen && alphabets.length === 0) {
      dispatch(fetchAlphabets())
      dispatch(fetchPopularCities())
      dispatch(fetchAllCities())
    }
  }, [isOpen, alphabets.length, dispatch])

  const handleSelectCity = (cityName, lat = null, lng = null) => {
    const finalLat = lat || DEFAULT_APP_LOCATION.lat
    const finalLng = lng || DEFAULT_APP_LOCATION.lng

    dispatch(setCitySelection({ city: cityName, lat: finalLat, lng: finalLng }))
    dispatch(fetchNearbyTheatres({ lat: finalLat, lng: finalLng, radius: 40, city: cityName }))
    dispatch(fetchMovies({ city: cityName, limit: 50 }))
    onClose()
  }

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      return
    }

    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        let detectedCity = DEFAULT_APP_LOCATION.city

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
          const data = await res.json()
          detectedCity =
            data.address?.city ||
            data.address?.town ||
            data.address?.state_district ||
            DEFAULT_APP_LOCATION.city
        } catch { }

        handleSelectCity(detectedCity, latitude, longitude)
        setGeoLoading(false)
      },
      () => {
        setGeoLoading(false)
        handleSelectCity(DEFAULT_APP_LOCATION.city, DEFAULT_APP_LOCATION.lat, DEFAULT_APP_LOCATION.lng)
      }
    )
  }

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null
    const query = searchQuery.toLowerCase().trim()
    return allCities.filter((c) => c.name.toLowerCase().includes(query))
  }, [searchQuery, allCities])

  if (!isOpen) return null

  return (
    <div className="city-modal-overlay" onClick={onClose}>
      <div className="city-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="city-modal-header">
          <h2 className="city-modal-title">Select Location</h2>
          <button className="city-modal-close-btn" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <CitySearchBox
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <CityGpsButton
          geoLoading={geoLoading}
          onDetectLocation={handleCurrentLocation}
        />

        {searchResults ? (
          <AllCitiesList
            searchResults={searchResults}
            searchQuery={searchQuery}
            selectedCity={selectedCity}
            onSelectCity={handleSelectCity}
          />
        ) : (
          <>
            <PopularCitiesGrid
              popularCities={popularCities}
              selectedCity={selectedCity}
              onSelectCity={handleSelectCity}
            />

            <div className="city-all-section">
              <h3 className="city-section-title">All Cities</h3>
              <AlphabetFilterBar
                alphabets={alphabets}
                activeLetter={activeLetter}
                groupedCities={groupedCities}
                onLetterClick={setActiveLetter}
              />
              <AllCitiesList
                activeLetter={activeLetter}
                groupedCities={groupedCities}
                selectedCity={selectedCity}
                onSelectCity={handleSelectCity}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}