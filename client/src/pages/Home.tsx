import React, { useState } from "react"
import { Link } from "react-router-dom"
import { useGetMoviesQuery } from "../features/catalog/services/catalogApi"
import { FilterBar } from "../features/catalog/components/FilterBar"
import { MovieCard } from "../features/catalog/components/MovieCard"
import { useAppSelector, useAppDispatch } from "../app/hooks"
import { useLogoutMutation } from "../features/authentication/services/authApi"
import { logoutState } from "../features/authentication/store/authSlice"
import "../assets/styles/catalog.css"

export const Home: React.FC = () => {
    const [search, setSearch] = useState("")
    const [genre, setGenre] = useState("All")
    const { user, isAuthenticated } = useAppSelector((state) => state.auth)
    const { data, isLoading } = useGetMoviesQuery({ search, genre })
    const [logout] = useLogoutMutation()
    const dispatch = useAppDispatch()

    const handleLogout = async () => {
        try {
            await logout().unwrap()
            dispatch(logoutState())
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="catalog-container">
            <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 backdrop-blur z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link to="/" className="text-2xl font-bold text-indigo-400">MoviePass</Link>
                    <div className="flex items-center gap-4">
                        {isAuthenticated && user ? (
                            <>
                                <span className="text-slate-300 text-sm font-medium">Hello, {user.name}</span>
                                <Link to="/profile" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700">
                                    Settings
                                </Link>
                                <button onClick={handleLogout} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 cursor-pointer">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-2">
                                <Link to="/login" className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-sm font-semibold rounded-lg border border-slate-700">
                                    Login
                                </Link>
                                <Link to="/register" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold rounded-lg">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="catalog-main">
                <FilterBar
                    search={search}
                    genre={genre}
                    onSearchChange={setSearch}
                    onGenreChange={setGenre}
                />

                {isLoading ? (
                    <div className="text-center py-16 text-slate-400">Loading movie catalog...</div>
                ) : data?.movies && data.movies.length > 0 ? (
                    <div className="movies-grid">
                        {data.movies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-slate-400">No movies found matching criteria.</div>
                )}
            </main>
        </div>
    )
}