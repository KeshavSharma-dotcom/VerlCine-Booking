import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { fetchMovies } from "../../redux/thunks/movieThunks"
import "../../assets/styles/adminDashboard.css"

export const AdminDashboard = () => {
    const dispatch = useDispatch()
    const { movies } = useSelector((state) => state.movie)
    const [activeTab, setActiveTab] = useState("theatres")

    const [theatres, setTheatres] = useState([])
    const [statusMsg, setStatusMsg] = useState({ type: "", text: "" })
    const [submitting, setSubmitting] = useState(false)

    const [theatreForm, setTheatreForm] = useState({
        name: "",
        city: "Jaipur",
        address: "",
        screensCount: 1,
        seatsPerScreen: 60
    })

    const [productionForm, setProductionForm] = useState({
        title: "",
        description: "",
        genre: "Action",
        durationMinutes: 120,
        rating: "PG-13",
        posterUrl: "",
        isLiveShow: false
    })

    const [showtimeForm, setShowtimeForm] = useState({
        movieId: "",
        theatreId: "",
        screenNumber: 1,
        startTime: "",
        ticketPrice: 250
    })

    const loadTheatres = async () => {
        try {
            const res = await fetch("/api/theatres", { credentials: "include" })
            const data = await res.json()
            if (data.theatres) setTheatres(data.theatres)
        } catch {
            setTheatres([])
        }
    }

    useEffect(() => {
        dispatch(fetchMovies({ limit: 100 }))
        loadTheatres()
    }, [dispatch])

    const handleTheatreSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setStatusMsg({ type: "", text: "" })

        const screens = Array.from({ length: Number(theatreForm.screensCount) }, (_, idx) => ({
            screenNumber: idx + 1,
            totalSeats: Number(theatreForm.seatsPerScreen)
        }))

        try {
            const res = await fetch("/api/theatres", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: theatreForm.name,
                    city: theatreForm.city,
                    address: theatreForm.address,
                    screens
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to create theatre")

            setStatusMsg({ type: "success", text: `Theatre "${data.theatre.name}" added successfully` })
            setTheatreForm({ name: "", city: "Jaipur", address: "", screensCount: 1, seatsPerScreen: 60 })
            loadTheatres()
        } catch (err) {
            setStatusMsg({ type: "error", text: err.message })
        } finally {
            setSubmitting(false)
        }
    }

    const handleProductionSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setStatusMsg({ type: "", text: "" })

        const selectedGenreArray = productionForm.isLiveShow
            ? [productionForm.genre, "Live Show"]
            : [productionForm.genre]

        try {
            const res = await fetch("/api/movies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title: productionForm.title,
                    description: productionForm.description,
                    genre: selectedGenreArray,
                    durationMinutes: Number(productionForm.durationMinutes),
                    rating: productionForm.rating,
                    posterUrl: productionForm.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80"
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to register title")

            setStatusMsg({ type: "success", text: `${productionForm.isLiveShow ? "Live Show" : "Movie"} "${data.movie.title}" registered successfully` })
            setProductionForm({
                title: "",
                description: "",
                genre: "Action",
                durationMinutes: 120,
                rating: "PG-13",
                posterUrl: "",
                isLiveShow: false
            })
            dispatch(fetchMovies({ limit: 100 }))
        } catch (err) {
            setStatusMsg({ type: "error", text: err.message })
        } finally {
            setSubmitting(false)
        }
    }

    const handleShowtimeSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setStatusMsg({ type: "", text: "" })

        try {
            const res = await fetch("/api/showtimes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    movieId: showtimeForm.movieId,
                    theatreId: showtimeForm.theatreId,
                    screenNumber: Number(showtimeForm.screenNumber),
                    startTime: showtimeForm.startTime,
                    ticketPrice: Number(showtimeForm.ticketPrice)
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to schedule showtime")

            setStatusMsg({ type: "success", text: "Showtime scheduled successfully with fresh seat layout" })
            setShowtimeForm({
                movieId: "",
                theatreId: "",
                screenNumber: 1,
                startTime: "",
                ticketPrice: 250
            })
        } catch (err) {
            setStatusMsg({ type: "error", text: err.message })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="admin-dashboard-layout">
            <main className="admin-dashboard-content">
                <div className="admin-header-row">
                    <div>
                        <h1 className="admin-title">CineVerl Control Center</h1>
                        <p className="admin-subtitle">Manage cinema locations, entertainment productions, and live schedules</p>
                    </div>
                </div>

                <nav className="admin-tabs-nav">
                    <button
                        onClick={() => { setActiveTab("theatres"); setStatusMsg({ type: "", text: "" }) }}
                        className={`admin-tab-btn ${activeTab === "theatres" ? "active" : ""}`}
                    >
                        Theatres
                    </button>
                    <button
                        onClick={() => { setActiveTab("productions"); setStatusMsg({ type: "", text: "" }) }}
                        className={`admin-tab-btn ${activeTab === "productions" ? "active" : ""}`}
                    >
                        Movies & Shows
                    </button>
                    <button
                        onClick={() => { setActiveTab("showtimes"); setStatusMsg({ type: "", text: "" }) }}
                        className={`admin-tab-btn ${activeTab === "showtimes" ? "active" : ""}`}
                    >
                        Schedule Showtimes
                    </button>
                </nav>

                {statusMsg.text && (
                    <div className={`admin-alert ${statusMsg.type}`}>
                        {statusMsg.text}
                    </div>
                )}

                {activeTab === "theatres" && (
                    <section className="admin-card-surface">
                        <h2>Register New Cinema / Venue</h2>
                        <form onSubmit={handleTheatreSubmit} className="admin-form-grid">
                            <div className="admin-form-group">
                                <label className="admin-label">Theatre Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Cinepolis WTP"
                                    className="admin-input"
                                    value={theatreForm.name}
                                    onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">City</label>
                                <input
                                    type="text"
                                    required
                                    className="admin-input"
                                    value={theatreForm.city}
                                    onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })}
                                />
                            </div>

                            <div className="admin-form-group full-width">
                                <label className="admin-label">Complete Street Address</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Jawahar Lal Nehru Marg, Malviya Nagar"
                                    className="admin-input"
                                    value={theatreForm.address}
                                    onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Number of Screens</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="8"
                                    required
                                    className="admin-input"
                                    value={theatreForm.screensCount}
                                    onChange={(e) => setTheatreForm({ ...theatreForm, screensCount: e.target.value })}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Seats Per Screen</label>
                                <input
                                    type="number"
                                    min="20"
                                    max="120"
                                    required
                                    className="admin-input"
                                    value={theatreForm.seatsPerScreen}
                                    onChange={(e) => setTheatreForm({ ...theatreForm, seatsPerScreen: e.target.value })}
                                />
                            </div>

                            <div className="admin-form-group full-width">
                                <button type="submit" disabled={submitting} className="admin-submit-btn">
                                    {submitting ? "Saving Venue..." : "Add Cinema Hall"}
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                {activeTab === "productions" && (
                    <section className="admin-card-surface">
                        <h2>Publish Movie or Live Stage Show</h2>
                        <form onSubmit={handleProductionSubmit} className="admin-form-grid">
                            <div className="admin-form-group">
                                <label className="admin-label">Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Dune: Part Two or Bassi Standup"
                                    className="admin-input"
                                    value={productionForm.title}
                                    onChange={(e) => setProductionForm({ ...productionForm, title: e.target.value })}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Production Format</label>
                                <select
                                    className="admin-select"
                                    value={productionForm.isLiveShow ? "show" : "movie"}
                                    onChange={(e) => setProductionForm({ ...productionForm, isLiveShow: e.target.value === "show" })}
                                >
                                    <option value="movie">Theatrical Movie</option>
                                    <option value="show">Live Stage / Standup Comedy</option>
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Genre</label>
                                <select
                                    className="admin-select"
                                    value={productionForm.genre}
                                    onChange={(e) => setProductionForm({ ...productionForm, genre: e.target.value })}
                                >
                                    {productionForm.isLiveShow ? (
                                        <>
                                            <option value="Standup Comedy">Standup Comedy</option>
                                            <option value="Music Concert">Music Concert</option>
                                            <option value="Theatre Play">Theatre Play</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Action">Action</option>
                                            <option value="Sci-Fi">Sci-Fi</option>
                                            <option value="Adventure">Adventure</option>
                                            <option value="Drama">Drama</option>
                                            <option value="Comedy">Comedy</option>
                                            <option value="Thriller">Thriller</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Duration (Minutes)</label>
                                <input
                                    type="number"
                                    min="30"
                                    max="300"
                                    required
                                    className="admin-input"
                                    value={productionForm.durationMinutes}
                                    onChange={(e) => setProductionForm({ ...productionForm, durationMinutes: e.target.value })}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Age Rating</label>
                                <select
                                    className="admin-select"
                                    value={productionForm.rating}
                                    onChange={(e) => setProductionForm({ ...productionForm, rating: e.target.value })}
                                >
                                    <option value="U">U (Universal)</option>
                                    <option value="UA">UA</option>
                                    <option value="PG-13">PG-13</option>
                                    <option value="R">R (Adult 18+)</option>
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Poster Asset URL</label>
                                <input
                                    type="url"
                                    placeholder="https://image.tmdb.org/t/p/w780/..."
                                    className="admin-input"
                                    value={productionForm.posterUrl}
                                    onChange={(e) => setProductionForm({ ...productionForm, posterUrl: e.target.value })}
                                />
                            </div>

                            <div className="admin-form-group full-width">
                                <label className="admin-label">Synopsis / Description</label>
                                <textarea
                                    required
                                    placeholder="Enter performance plot or event outline..."
                                    className="admin-textarea"
                                    value={productionForm.description}
                                    onChange={(e) => setProductionForm({ ...productionForm, description: e.target.value })}
                                />
                            </div>

                            <div className="admin-form-group full-width">
                                <button type="submit" disabled={submitting} className="admin-submit-btn">
                                    {submitting ? "Publishing..." : "Publish Title"}
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                {activeTab === "showtimes" && (
                    <section className="admin-card-surface">
                        <h2>Create Showtime Session</h2>
                        <form onSubmit={handleShowtimeSubmit} className="admin-form-grid">
                            <div className="admin-form-group">
                                <label className="admin-label">Select Movie or Show</label>
                                <select
                                    required
                                    className="admin-select"
                                    value={showtimeForm.movieId}
                                    onChange={(e) => setShowtimeForm({ ...showtimeForm, movieId: e.target.value })}
                                >
                                    <option value="">-- Choose Title --</option>
                                    {movies.map((m) => (
                                        <option key={m._id} value={m._id}>{m.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Select Venue / Theatre</label>
                                <select
                                    required
                                    className="admin-select"
                                    value={showtimeForm.theatreId}
                                    onChange={(e) => setShowtimeForm({ ...showtimeForm, theatreId: e.target.value })}
                                >
                                    <option value="">-- Choose Theatre --</option>
                                    {theatres.map((t) => (
                                        <option key={t._id} value={t._id}>{t.name} ({t.city})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Screen Number</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    required
                                    className="admin-input"
                                    value={showtimeForm.screenNumber}
                                    onChange={(e) => setShowtimeForm({ ...showtimeForm, screenNumber: e.target.value })}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Ticket Price (₹)</label>
                                <input
                                    type="number"
                                    min="50"
                                    step="10"
                                    required
                                    className="admin-input"
                                    value={showtimeForm.ticketPrice}
                                    onChange={(e) => setShowtimeForm({ ...showtimeForm, ticketPrice: e.target.value })}
                                />
                            </div>

                            <div className="admin-form-group full-width">
                                <label className="admin-label">Session Date & Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="admin-input"
                                    value={showtimeForm.startTime}
                                    onChange={(e) => setShowtimeForm({ ...showtimeForm, startTime: e.target.value })}
                                />
                            </div>

                            <div className="admin-form-group full-width">
                                <button type="submit" disabled={submitting} className="admin-submit-btn">
                                    {submitting ? "Scheduling..." : "Generate Showtime & Seat Matrix"}
                                </button>
                            </div>
                        </form>
                    </section>
                )}
            </main>
        </div>
    )
}

export default AdminDashboard