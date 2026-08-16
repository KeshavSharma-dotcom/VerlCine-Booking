import { baseApi } from "../../../core/api/baseApi"
import type { ISeat } from "../../../core/types"

export const bookingApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getShowtimeSeats: builder.query<{ success: boolean; seats: ISeat[] }, string>({
            query: (showtimeId) => `/showtimes/${showtimeId}/seats`,
            providesTags: ["Booking"]
        })
    })
})

export const { useGetShowtimeSeatsQuery } = bookingApi