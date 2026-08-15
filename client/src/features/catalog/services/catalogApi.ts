import { baseApi } from "../../../core/api/baseApi"
import type { IMovie } from "../../../core/types"

export interface MovieQueryParams {
    search?: string
    genre?: string
}

export const catalogApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMovies: builder.query<{ success: boolean; movies: IMovie[] }, MovieQueryParams | void>({
            query: (params) => {
                const searchParams = new URLSearchParams()
                if (params?.search) searchParams.append("search", params.search)
                if (params?.genre && params.genre !== "All") searchParams.append("genre", params.genre)
                const queryString = searchParams.toString()
                return queryString ? `/movies?${queryString}` : "/movies"
            },
            providesTags: ["Movie"]
        }),
        getMovieDetails: builder.query<{ success: boolean; movie: IMovie }, string>({
            query: (movieId) => `/movies/${movieId}`,
            providesTags: ["Movie"]
        })
    })
})

export const { useGetMoviesQuery, useGetMovieDetailsQuery } = catalogApi