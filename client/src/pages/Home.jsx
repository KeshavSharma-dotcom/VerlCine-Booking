import React, { useEffect, useState, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { fetchMovies } from "../redux/thunks/movieThunks"
import { fetchNearbyTheatres, fetchTheatreCities } from "../redux/thunks/theatreThunks"
import Navbar from "../components/NavBar"
import { CitySelectorModal } from "../components/city/city"
import { Footer } from "../components/main/Footer"
import {
    HomeAnimatedBg,
    HomeSpotlightBanner,
    HomeFeedControls,
    HomeCatalogGrid
} from "../components/home/home"
import "../assets/styles/animatedBg.css"
import "../assets/styles/home.css"

export const Home = () => {
    const dispatch = useDispatch()
    const { isAuthenticated } = useSelector((state) => state.auth)
    const { movies, loading: moviesLoading, error: moviesError } = useSelector((state) => state.movie)
    const { selectedCity, userLocation } = useSelector((state) => state.theatre)

    const [activeTab, setActiveTab] = useState("all")
    const [selectedGenre, setSelectedGenre] = useState("All")
    const [isCityModalOpen, setIsCityModalOpen] = useState(false)

    useEffect(() => {
        dispatch(fetchMovies({ limit: 50 }))
        dispatch(fetchTheatreCities())
    }, [dispatch])

    useEffect(() => {
        dispatch(
            fetchNearbyTheatres({
                lat: userLocation?.lat || 28.6139,
                lng: userLocation?.lng || 77.2090,
                radius: userLocation?.radiusKm || 40,
                city: selectedCity || "Delhi NCR"
            })
        )
    }, [dispatch, selectedCity, userLocation?.lat, userLocation?.lng, userLocation?.radiusKm])

    const isLiveEvent = (item) => {
        return item.genre?.some((g) =>
            ["Standup Comedy", "Live Show", "Music Concert", "Theatre Play"].includes(g)
        )
    }

    const featuredSpotlight = useMemo(() => {
        if (!movies || movies.length === 0) return null
        return movies.find((m) => m.rating === "PG-13" && m.posterUrl) || movies[0]
    }, [movies])

    const quadPosters = useMemo(() => {
        const valid = movies.filter((m) => m.posterUrl).map((m) => m.posterUrl)
        if (valid.length === 0) {
            return [
                "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80"
            ]
        }
        return [
            valid[0] || valid[0],
            valid[1] || valid[0],
            valid[2] || valid[0],
            valid[3] || valid[0]
        ]
    }, [movies])

    const availableGenres = useMemo(() => {
        const set = new Set()
        movies.forEach((item) => {
            const isLive = isLiveEvent(item)
            if (activeTab === "movies" && isLive) return
            if (activeTab === "shows" && !isLive) return
            item.genre?.forEach((g) => set.add(g))
        })
        return ["All", ...Array.from(set)]
    }, [movies, activeTab])

    const filteredCatalog = useMemo(() => {
        return movies.filter((item) => {
            const isLive = isLiveEvent(item)
            if (activeTab === "movies" && isLive) return false
            if (activeTab === "shows" && !isLive) return false
            if (selectedGenre !== "All" && !item.genre?.includes(selectedGenre)) return false
            return true
        })
    }, [movies, activeTab, selectedGenre])

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setSelectedGenre("All")
    }

    return (
        <div className="home-container">
            <CitySelectorModal
                isOpen={isCityModalOpen}
                onClose={() => setIsCityModalOpen(false)}
            />

            <HomeAnimatedBg quadPosters={quadPosters} />

            <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

            <main className="home-content-wrap">
                {/* <HomeSpotlightBanner
                    featuredSpotlight={featuredSpotlight}
                    isAuthenticated={isAuthenticated}
                    selectedCity={selectedCity}
                /> */}

                <HomeFeedControls
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    selectedCity={selectedCity}
                    onOpenCityModal={() => setIsCityModalOpen(true)}
                    availableGenres={availableGenres}
                    selectedGenre={selectedGenre}
                    onSelectGenre={setSelectedGenre}
                />

                <HomeCatalogGrid
                    loading={moviesLoading}
                    error={moviesError}
                    filteredCatalog={filteredCatalog}
                    selectedCity={selectedCity}
                    isAuthenticated={isAuthenticated}
                />
            </main>

            <Footer
                selectedCity={selectedCity}
                socialLinks={{
                    instagram: "https://instagram.com/yourhandle",
                    facebook: "https://facebook.com/yourhandle",
                    youtube: "https://youtube.com/@yourchannel",
                    x: "https://x.com/yourhandle"
                }}
            />
        </div>
    )
}

export default Home