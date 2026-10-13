import React from "react"

export const PaymentPriceBreakup = ({ totalAmount = 0, seatCount = 1 }) => {
    const baseTicketTotal = Math.round(totalAmount * 0.82)
    const convenienceFee = Math.round(totalAmount * 0.15)
    const integratedTax = totalAmount - (baseTicketTotal + convenienceFee)

    return (
        <section className="payment-price-card">
            <h3 className="payment-card-title">Order Breakdown</h3>
            <div className="payment-breakup-list">
                <div className="payment-breakup-row">
                    <span>Base Ticket Fare ({seatCount} seat{seatCount > 1 ? "s" : ""})</span>
                    <span>₹{baseTicketTotal}</span>
                </div>
                <div className="payment-breakup-row">
                    <span>Convenience Fee (Internet Handling)</span>
                    <span>₹{convenienceFee}</span>
                </div>
                <div className="payment-breakup-row">
                    <span>Integrated GST (18%)</span>
                    <span>₹{integratedTax}</span>
                </div>
                <div className="payment-breakup-divider" />
                <div className="payment-breakup-row total-row">
                    <span>Grand Total (Payable)</span>
                    <span className="payment-grand-price">₹{totalAmount}</span>
                </div>
            </div>
        </section>
    )
}

export default PaymentPriceBreakup