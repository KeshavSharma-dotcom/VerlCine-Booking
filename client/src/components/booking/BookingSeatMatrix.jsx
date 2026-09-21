import React from "react"
import "../../assets/styles/seatBooking.css"

export const BookingSeatMatrix = ({
    seats = [],
    ticketPrice = 250,
    selectedSeats = [],
    onSeatClick
}) => {
    return (
        <div className="seat-grid-container">
            <div className="seat-grid-layout">
                {seats.map((seat) => {
                    const isChosen = selectedSeats.some((s) => s.seatNumber === seat.seatNumber)
                    const isUnavailable =
                        seat.status === "booked" ||
                        seat.status === "reserved" ||
                        seat.status === "locked"

                    let seatClass = "seat-item available"
                    if (isUnavailable) seatClass = "seat-item booked"
                    if (isChosen) seatClass = "seat-item selected"

                    return (
                        <button
                            key={seat.seatNumber}
                            onClick={() => onSeatClick(seat)}
                            disabled={isUnavailable}
                            className={seatClass}
                            title={`${seat.seatNumber} - ₹${ticketPrice}`}
                        >
                            {seat.seatNumber}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default BookingSeatMatrix