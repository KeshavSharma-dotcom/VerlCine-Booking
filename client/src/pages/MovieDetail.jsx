import React, { useEffect, useState, useMemo, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { CitySelectorModal } from "../components/city/city"
import { Footer } from "../components/main/Footer"
import {
    MovieHero,
    MovieAbout,
    MovieCastCrew,
    MovieTheatresSection
} from "../components/movie/movie"
import "../assets/styles/animatedBg.css"
import "../assets/styles/movieDetail.css"

export const MovieDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const theatresRef = useRef(null)

    const cityState = useSelector((state) => state.city || {})
    const theatreState = useSelector((state) => state.theatre || {})

    const selectedCity = cityState.selectedCity || theatreState.selectedCity || "Jaipur"
    const userLocation = cityState.userLocation || theatreState.userLocation || { lat: 26.9124, lng: 75.7873 }

    const [movie, setMovie] = useState(null)
    const [showtimesData, setShowtimesData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isCityModalOpen, setIsCityModalOpen] = useState(false)

    useEffect(() => {
        const fetchDetailsAndShowtimes = async () => {
            try {
                setLoading(true)
                setError(null)

                let movieRes = await fetch(`/api/v1/movies/${id}`)
                if (!movieRes.ok) movieRes = await fetch(`/api/movies/${id}`)
                if (!movieRes.ok) movieRes = await fetch(`/api/movie/${id}`)

                const movieJson = await movieRes.json()
                const resolvedMovie = movieJson.movie || movieJson.data || movieJson
                setMovie(resolvedMovie)

                const queryParams = new URLSearchParams({
                    movieId: id,
                    city: selectedCity
                })

                if (userLocation?.lat && userLocation?.lng) {
                    queryParams.append("lat", String(userLocation.lat))
                    queryParams.append("lng", String(userLocation.lng))
                }

                let showRes = await fetch(`/api/v1/showtimes?${queryParams.toString()}`)
                if (!showRes.ok) showRes = await fetch(`/api/showtimes?${queryParams.toString()}`)

                const showJson = await showRes.json()

                if (Array.isArray(showJson.groupedTheatres)) {
                    const normalized = showJson.groupedTheatres.map((gt) => {
                        const allShows = []
                        Object.values(gt.screens || {}).forEach((slots) => {
                            allShows.push(...slots)
                        })
                        return {
                            theatre: gt.theatre,
                            shows: allShows
                        }
                    })
                    setShowtimesData(normalized)
                } else {
                    const rawShows = showJson.showtimes || showJson.data || (Array.isArray(showJson) ? showJson : [])
                    setShowtimesData(rawShows)
                }
            } catch (err) {
                setError(err.message || "Failed to load movie information")
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchDetailsAndShowtimes()
    }, [id, selectedCity, userLocation?.lat, userLocation?.lng])

    const groupedTheatres = useMemo(() => {
        if (showtimesData.length > 0 && showtimesData[0]?.theatre && Array.isArray(showtimesData[0]?.shows)) {
            return showtimesData
        }

        const map = new Map()
        showtimesData.forEach((st) => {
            const theatreObj = typeof st.theatre === "object" ? st.theatre : null
            const theatreId = theatreObj?._id || st.theatre || "venue"

            if (!map.has(theatreId)) {
                map.set(theatreId, {
                    theatre: theatreObj || { name: "Cinema Hall", address: selectedCity },
                    shows: []
                })
            }
            map.get(theatreId).shows.push(st)
        })

        return Array.from(map.values()).sort((a, b) => {
            const distA = a.theatre.distanceKm ?? 9999
            const distB = b.theatre.distanceKm ?? 9999
            return distA - distB
        })
    }, [showtimesData, selectedCity])

    const handleSmoothScrollToTheatres = () => {
        theatresRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleSelectSlot = (showtimeId) => {
        navigate(`/booking/${showtimeId}`)
    }

    if (loading) {
        return (
            <div className="movie-detail-container">
                <div className="home-loading-state" style={{ margin: "auto", textAlign: "center", padding: "8rem 0" }}>
                    <div className="home-spinner" />
                    <p>Loading details & showtimes...</p>
                </div>
            </div>
        )
    }

    if (error || !movie) {
        return (
            <div className="movie-detail-container">
                <div className="home-error-state" style={{ margin: "auto", textAlign: "center", padding: "8rem 0" }}>
                    <p>{error || "Movie not found"}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="movie-detail-book-cta"
                        style={{ marginTop: "1rem" }}
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="movie-detail-container">
            <CitySelectorModal
                isOpen={isCityModalOpen}
                onClose={() => setIsCityModalOpen(false)}
            />

            <MovieHero
                movie={movie}
                selectedCity={selectedCity}
                onOpenCityModal={() => setIsCityModalOpen(true)}
                onBookSeatsClick={handleSmoothScrollToTheatres}
            />

            <main className="movie-detail-body">
                <MovieAbout movie={movie} />

                <MovieCastCrew movie={movie} />

                <MovieTheatresSection
                    theatresRef={theatresRef}
                    groupedTheatres={groupedTheatres}
                    selectedCity={selectedCity}
                    onOpenCityModal={() => setIsCityModalOpen(true)}
                    onSelectSlot={handleSelectSlot}
                />
            </main>

            <Footer selectedCity={selectedCity} />
        </div>
    )
}

export default MovieDetail