import React from "react"
import "../../../assets/styles/catalog.css"

interface FilterBarProps {
    search: string
    genre: string
    onSearchChange: (value: string) => void
    onGenreChange: (value: string) => void
}

const GENRES = ["All", "Action", "Adventure", "Sci-Fi", "Drama", "Thriller", "Comedy"]

export const FilterBar: React.FC<FilterBarProps> = ({ search, genre, onSearchChange, onGenreChange }) => {
    return (
        <div className="filter-bar">
            <input
                type="text"
                placeholder="Search movies..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input"
            />
            <div className="flex items-center gap-3 w-full md:w-auto">
                <label className="text-sm text-slate-400">Genre:</label>
                <select value={genre} onChange={(e) => onGenreChange(e.target.value)} className="filter-select">
                    {GENRES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}