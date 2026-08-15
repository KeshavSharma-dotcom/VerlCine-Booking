import React from "react"
import { useParams, Link } from "react-router-dom"
import { useGetMovieDetailsQuery } from "../features/catalog/services/catalogApi"
import "../assets/styles/catalog.css"

export const MovieDetails: React.FC = () => {
    const { movieId } = useParams<{ movieId: string }>()
    const { data, isLoading } = useGetMovieDetailsQuery(movieId || "")

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                Loading movie details...
            </div>
        )
    }

    if (!data?.movie) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
                <p>Movie not found.</p>
                <Link to="/" className="text-indigo-400 hover:underline">Back to Catalog</Link>
            </div>
        )
    }

    const { movie } = data

    return (
        <div className="catalog-container">
            <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 backdrop-blur z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link to="/" className="text-indigo-400 hover:underline text-sm font-medium">← Back to Catalog</Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-800 p-8 rounded-2xl border border-slate-700">
                    <div className="aspect-[2/3] overflow-hidden rounded-xl bg-slate-950">
                        <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="md:col-span-2 flex flex-col justify-between space-y-6">
                        <div className="space-y-3">
                            <h1 className="text-3xl font-bold text-white">{movie.title}</h1>
                            <p className="text-sm text-slate-400">Duration: {movie.durationMinutes} minutes</p>
                            <div className="flex flex-wrap gap-2">
                                {movie.genre?.map((g) => (
                                    <span key={g} className="px-2.5 py-1 bg-slate-700 rounded-md text-xs font-medium text-indigo-300">
                                        {g}
                                    </span>
                                ))}
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed pt-2">{movie.description}</p>
                        </div>
                        <div>
                            <Link to={`/book/${movie.id}`} className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-center">
                                Select Showtime & Seats
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}