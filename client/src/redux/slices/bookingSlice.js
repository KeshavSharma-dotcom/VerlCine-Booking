import { createSlice } from "@reduxjs/toolkit"
import {
    processBookingPayment,
    fetchBookingDetails
} from "../thunks/bookingThunks"

const initialState = {
    currentBooking: null,
    bookingsList: [],
    selectedSeats: [],
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    },
    checkoutLoading: false,
    detailsLoading: false,
    historyLoading: false,
    cancelLoading: false,
    error: null,
    successMessage: null
}

const bookingSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        setSelectedSeats: (state, action) => {
            state.selectedSeats = action.payload
        },
        toggleSeatSelection: (state, action) => {
            const seat = action.payload
            const exists = state.selectedSeats.find((s) => s.seatNumber === seat.seatNumber)
            if (exists) {
                state.selectedSeats = state.selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber)
            } else {
                if (state.selectedSeats.length < 8) {
                    state.selectedSeats.push(seat)
                }
            }
        },
        clearSelectedSeats: (state) => {
            state.selectedSeats = []
        },
        clearCurrentBooking: (state) => {
            state.currentBooking = null
            state.error = null
        },
        clearBookingMessages: (state) => {
            state.error = null
            state.successMessage = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(processBookingPayment.pending, (state) => {
                state.checkoutLoading = true
                state.error = null
            })
            .addCase(processBookingPayment.fulfilled, (state, action) => {
                state.checkoutLoading = false
                state.currentBooking = action.payload
                state.selectedSeats = []
                state.successMessage = "Payment successful! Booking confirmed."
            })
            .addCase(processBookingPayment.rejected, (state, action) => {
                state.checkoutLoading = false
                state.error = action.payload || "Booking transaction failed"
            })

            .addCase(fetchBookingDetails.pending, (state) => {
                state.detailsLoading = true
                state.error = null
            })
            .addCase(fetchBookingDetails.fulfilled, (state, action) => {
                state.detailsLoading = false
                state.currentBooking = action.payload
            })
            .addCase(fetchBookingDetails.rejected, (state, action) => {
                state.detailsLoading = false
                state.error = action.payload || "Failed to load booking details"
            })
    }
})

export const {
    setSelectedSeats,
    toggleSeatSelection,
    clearSelectedSeats,
    clearCurrentBooking,
    clearBookingMessages
} = bookingSlice.actions

export default bookingSlice.reducer