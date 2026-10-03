import React, { useMemo } from "react"
import "../../assets/styles/seatBooking.css"

export const BookingCheckoutBar = ({
    selectedSeats = [],
    ticketPrice = 250,
    bookingLoading,
    onConfirmBooking
}) => {
    const totalAmount = useMemo(() => {
        return selectedSeats.reduce((acc, seat) => {
            return acc + (seat.price || ticketPrice)
        }, 0)
    }, [selectedSeats, ticketPrice])

    return (
        <div className="booking-checkout-bar">
            <div className="checkout-summary">
                <span className="summary-label">Selected Seats:</span>
                <span className="summary-seats">
                    {selectedSeats.length > 0
                        ? selectedSeats.map((s) => s.seatNumber).join(", ")
                        : "None"}
                </span>
                <span className="summary-total">Total: ₹{totalAmount}</span>
            </div>

            <button
                type="button"
                onClick={onConfirmBooking}
                disabled={selectedSeats.length === 0 || bookingLoading}
                className="checkout-confirm-btn"
            >
                {bookingLoading ? "Reserving..." : `Pay ₹${totalAmount}`}
            </button>
        </div>
    )
}

export default BookingCheckoutBar