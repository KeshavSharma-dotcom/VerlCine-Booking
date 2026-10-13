import React from "react"

export const PaymentSeatDetails = ({ seats = [] }) => {
    return (
        <section className="payment-seats-card">
            <div className="payment-card-header">
                <h3 className="payment-card-title">Reserved Seats</h3>
                <span className="payment-seat-counter">{seats.length} Ticket(s)</span>
            </div>
            <div className="payment-seat-pills-wrap">
                {seats.map((seatNum) => (
                    <span key={seatNum} className="payment-seat-pill">
                        {seatNum}
                    </span>
                ))}
            </div>
            <p className="payment-seat-notice">
                Seats are locked and protected. Please complete your transaction to finalize your reservation.
            </p>
        </section>
    )
}

export default PaymentSeatDetails