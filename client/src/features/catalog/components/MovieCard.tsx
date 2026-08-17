import React from "react"
import { Link } from "react-router-dom"
import type { IMovie } from "../../../core/types"
import "../../../assets/styles/catalog.css"

interface MovieCardProps {
    movie: IMovie
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
    return (
        <div className="movie-card group">
            <div className="movie-poster-wrapper">
                <img src={movie.posterUrl} alt={movie.title} className="movie-poster-img" />
            </div>
            <div className="movie-info">
                <div>
                    <h3 className="movie-title">{movie.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{movie.durationMinutes} mins</p>
                </div>
                <div className="movie-badge-list">
                    {movie.genre?.map((g) => (
                        <span key={g} className="movie-badge">{g}</span>
                    ))}
                </div>
                <Link to={`/movie/${movie.id}`} className="book-btn">
                    View Details
                </Link>
            </div>
        </div>
    )
}