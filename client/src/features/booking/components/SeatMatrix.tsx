import React from "react"
import type { ISeat } from "../../../core/types"
import "../../../assets/styles/booking.css"

interface SeatMatrixProps {
    seats: ISeat[]
    currentUserId?: string
    selectedSeat: string | null
    onSelectSeat: (seatNumber: string) => void
}

export const SeatMatrix: React.FC<SeatMatrixProps> = ({
    seats,
    currentUserId,
    selectedSeat,
    onSelectSeat
}) => {
    const getSeatClass = (seat: ISeat) => {
        if (seat.status === "booked") return "seat-booked"
        if (selectedSeat === seat.seatNumber || (seat.status === "locked" && seat.lockedBy === currentUserId)) {
            return "seat-selected-by-me"
        }
        if (seat.status === "locked") return "seat-locked"
        return "seat-available"
    }

    return (
        <div className="seat-matrix-wrapper">
            <div className="screen-indicator">Screen Area</div>
            <div className="seat-grid">
                {seats.map((seat) => {
                    const isBooked = seat.status === "booked"
                    const isLockedByOther = seat.status === "locked" && seat.lockedBy !== currentUserId && selectedSeat !== seat.seatNumber

                    return (
                        <button
                            key={seat.seatNumber}
                            disabled={isBooked || isLockedByOther}
                            onClick={() => onSelectSeat(seat.seatNumber)}
                            className={`seat-btn ${getSeatClass(seat)}`}
                        >
                            {seat.seatNumber}
                        </button>
                    )
                })}
            </div>
            <div className="booking-legend">
                <div className="legend-item">
                    <span className="legend-dot bg-slate-700 border border-slate-600"></span>
                    <span>Available</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot bg-indigo-600"></span>
                    <span>Selected</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot bg-amber-500/30 border border-amber-500/50"></span>
                    <span>Locked</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot bg-red-950/60 border border-red-900/30"></span>
                    <span>Booked</span>
                </div>
            </div>
        </div>
    )
}