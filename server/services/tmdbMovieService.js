const GENRE_MAP = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sci-Fi",
    53: "Thriller",
    10752: "War",
    37: "Western"
}

const TMDB_API_KEY = process.env.TMDB_API_KEY || "8472506e93e0b25e79144415cfbbfae2"

const fetchNowPlayingMovies = async (region = "IN") => {
    try {
        const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1&region=${region}`
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) })

        if (!res.ok) {
            throw new Error(`TMDB error: ${res.status}`)
        }

        const data = await res.json()
        const rawMovies = data.results || []

        return rawMovies.filter((m) => m.poster_path && m.title).map((m) => ({
            title: m.title,
            description: m.overview || "Now running in physical theatres across the region.",
            genre: (m.genre_ids && m.genre_ids.length > 0)
                ? m.genre_ids.map((id) => GENRE_MAP[id] || "Drama").filter(Boolean).slice(0, 3)
                : ["Action", "Drama"],
            durationMinutes: 120 + Math.floor((m.id % 45)),
            rating: m.adult ? "R" : (m.vote_average >= 7 ? "PG-13" : "PG"),
            posterUrl: `https://image.tmdb.org/t/p/w780${m.poster_path}`,
            isActive: true
        }))
    } catch (err) {
        return []
    }
}

module.exports = {
    fetchNowPlayingMovies
}