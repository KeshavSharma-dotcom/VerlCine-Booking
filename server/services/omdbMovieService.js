const OMDB_API_KEY = process.env.OMDB_KEY

const CURRENT_THEATRE_QUERIES = [
    "Dune",
    "Gladiator",
    "Deadpool",
    "Moana",
    "Wicked",
    "Alien",
    "Venom",
    "Spider-Man",
    "Interstellar"
]

const parseDuration = (runtimeStr) => {
    if (!runtimeStr || runtimeStr === "N/A") return 120
    const match = runtimeStr.match(/\d+/)
    return match ? Number(match[0]) : 120
}

const fetchOmdbMovieDetails = async (title) => {
    const key = process.env.OMDB_KEY || OMDB_API_KEY
    if (!key) {
        throw new Error("OMDB_KEY is missing in your .env file")
    }

    const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${key}`, {
        signal: AbortSignal.timeout(10000)
    })

    if (!res.ok) {
        throw new Error(`OMDb HTTP error: ${res.status}`)
    }

    const data = await res.json()

    if (data.Response === "False" || !data.Title) {
        return null
    }

    return {
        title: data.Title,
        description: data.Plot && data.Plot !== "N/A" ? data.Plot : "Currently running in theatres.",
        genre: data.Genre && data.Genre !== "N/A"
            ? data.Genre.split(",").map((g) => g.trim()).slice(0, 3)
            : ["Action", "Drama"],
        durationMinutes: parseDuration(data.Runtime),
        rating: data.Rated && data.Rated !== "N/A" ? data.Rated : "PG-13",
        posterUrl: data.Poster && data.Poster !== "N/A"
            ? data.Poster
            : "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
        isActive: true
    }
}

const fetchLiveTheatricalMovies = async () => {
    const key = process.env.OMDB_KEY || OMDB_API_KEY
    if (!key) {
        throw new Error("OMDB_KEY is missing in your .env file")
    }

    const movies = []
    for (const title of CURRENT_THEATRE_QUERIES) {
        try {
            const movie = await fetchOmdbMovieDetails(title)
            if (movie) {
                movies.push(movie)
            }
        } catch {
            continue
        }
    }

    if (movies.length === 0) {
        throw new Error("Failed to fetch movies from OMDb API. Check your OMDB_KEY and network connection.")
    }

    return movies
}

module.exports = {
    fetchLiveTheatricalMovies,
    fetchOmdbMovieDetails
}