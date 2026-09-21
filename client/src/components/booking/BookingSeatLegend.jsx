import React from "react"
import "../../assets/styles/seatBooking.css"

export const BookingSeatLegend = () => {
    return (
        <div className="seat-legend-bar">
            <div className="legend-item">
                <span className="legend-sample available" />
                <span>Available</span>
            </div>
            <div className="legend-item">
                <span className="legend-sample selected" />
                <span>Selected</span>
            </div>
            <div className="legend-item">
                <span className="legend-sample booked" />
                <span>Booked</span>
            </div>
        </div>
    )
}

export default BookingSeatLegend