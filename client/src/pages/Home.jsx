import React from "react"
import { Link } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { logoutUserThunk } from "../redux/thunks/authThunks"
import namedLogo from "../assets/images/namedLogo.png"
import "../assets/styles/home.css"

export const Home = () => {
    const dispatch = useDispatch()
    const { isAuthenticated, user } = useSelector((state) => state.auth)

    const featuredMovies = [
        {
            id: 1,
            title: "Interstellar Odyssey",
            genre: "Sci-Fi / Adventure",
            rating: "4.9",
            image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600"
        },
        {
            id: 2,
            title: "Cyber City 2099",
            genre: "Action / Thriller",
            rating: "4.7",
            image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600"
        },
        {
            id: 3,
            title: "The Last Horizon",
            genre: "Drama / Mystery",
            rating: "4.8",
            image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=600"
        }
    ]

    const handleLogout = () => {
        dispatch(logoutUserThunk())
    }

    return (
        <div className="home-container">
            <header className="home-navbar">
                <Link to="/" className="home-brand-logo-container">
                    <img src={namedLogo} alt="CineVerl Logo" className="home-brand-logo-img" />
                </Link>

                <div className="home-nav-actions">
                    {isAuthenticated ? (
                        <div className="home-nav-user-group">
                            <span className="home-nav-username">Hi, {user?.name?.split(" ")[0]}</span>
                            <button onClick={handleLogout} className="home-nav-logout-btn">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="home-nav-login">
                                Login
                            </Link>
                            <Link to="/register" className="home-nav-register">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </header>

            <section className="home-hero-section">
                <div className="home-hero-glow-1"></div>
                <div className="home-hero-glow-2"></div>

                <span className="home-badge">Cinematic Experience Redefined</span>

                <h1 className="home-hero-title">
                    Book Your Favorite Movies <br />
                    <span className="home-title-gradient">Without the Hassle</span>
                </h1>

                <p className="home-hero-desc">
                    Explore blockbusters, reserve the best seats in the house, and dive into an unforgettable cinematic journey with CineVerl.
                </p>

                <div className="home-hero-buttons">
                    <a href="#trending" className="home-btn-explore">
                        Explore Movies Now
                    </a>
                    {!isAuthenticated && (
                        <Link to="/login" className="home-btn-signin">
                            Sign In to Account
                        </Link>
                    )}
                </div>
            </section>

            <section id="trending" className="home-trending-section">
                <div className="home-trending-header">
                    <h2 className="home-section-title">Trending Now</h2>
                    <p className="home-section-subtitle">Handpicked blockbusters playing in theaters this week.</p>
                </div>

                <div className="home-movies-grid">
                    {featuredMovies.map((movie) => (
                        <div key={movie.id} className="home-movie-card">
                            <div className="home-movie-img-container">
                                <img src={movie.image} alt={movie.title} className="home-movie-img" />
                                <span className="home-movie-rating">★ {movie.rating}</span>
                            </div>
                            <div className="home-movie-content">
                                <span className="home-movie-genre">{movie.genre}</span>
                                <h3 className="home-movie-title">{movie.title}</h3>
                                <Link
                                    to={isAuthenticated ? `/movie/${movie.id}` : "/register"}
                                    className="home-movie-btn"
                                >
                                    Book Tickets
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="home-footer">
                <p>&copy; {new Date().getFullYear()} CineVerl Inc. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default Home