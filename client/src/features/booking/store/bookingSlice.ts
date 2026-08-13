import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface BookingState {
    selectedSeat: string | null
    showtimeId: string | null
    lockExpiration: number | null
}

const initialState: BookingState = {
    selectedSeat: null,
    showtimeId: null,
    lockExpiration: null
}

const bookingSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        setSelectedSeat: (state, action: PayloadAction<{ seatNumber: string; showtimeId: string; expiresAt: number }>) => {
            state.selectedSeat = action.payload.seatNumber
            state.showtimeId = action.payload.showtimeId
            state.lockExpiration = action.payload.expiresAt
        },
        clearSelectedSeat: (state) => {
            state.selectedSeat = null
            state.showtimeId = null
            state.lockExpiration = null
        }
    }
})

export const { setSelectedSeat, clearSelectedSeat } = bookingSlice.actions
export default bookingSlice.reducer