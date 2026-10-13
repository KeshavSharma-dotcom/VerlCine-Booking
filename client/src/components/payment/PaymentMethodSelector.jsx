import React from "react"

export const PaymentMethodSelector = ({
    selectedGateway,
    setSelectedGateway,
    loading,
    onInitiatePayment,
    totalAmount
}) => {
    const methods = [
        { id: "upi", name: "Instant UPI", desc: "Google Pay, PhonePe, Paytm, CRED", icon: "⚡" },
        { id: "card", name: "Credit / Debit Cards", desc: "Visa, MasterCard, RuPay", icon: "💳" },
        { id: "netbanking", name: "Net Banking", desc: "All major Indian commercial banks", icon: "🏦" }
    ]

    return (
        <section className="payment-methods-card">
            <h3 className="payment-card-title">Select Payment Mode</h3>
            <div className="payment-options-grid">
                {methods.map((m) => (
                    <label
                        key={m.id}
                        className={`payment-option-label ${selectedGateway === m.id ? "selected" : ""}`}
                    >
                        <input
                            type="radio"
                            name="paymentMode"
                            value={m.id}
                            checked={selectedGateway === m.id}
                            onChange={() => setSelectedGateway(m.id)}
                            className="payment-radio-input"
                        />
                        <div className="payment-option-icon">{m.icon}</div>
                        <div className="payment-option-text">
                            <strong>{m.name}</strong>
                            <small>{m.desc}</small>
                        </div>
                    </label>
                ))}
            </div>

            <button
                type="button"
                onClick={onInitiatePayment}
                disabled={loading}
                className="payment-submit-cta"
            >
                {loading ? (
                    <span className="payment-cta-loading">
                        <span className="payment-spinner-tiny" /> Initializing Razorpay Gateway...
                    </span>
                ) : (
                    `Proceed to Pay ₹${totalAmount}`
                )}
            </button>

            <div className="payment-security-footer">
                <span>🔒 256-bit End-to-End SSL Encryption</span>
                <span>Powered by Razorpay Verified Engine</span>
            </div>
        </section>
    )
}

export default PaymentMethodSelector