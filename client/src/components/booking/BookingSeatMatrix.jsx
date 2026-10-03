import React, { useMemo } from "react"
import "../../assets/styles/seatBooking.css"

export const BookingSeatMatrix = ({
    seats = [],
    ticketPrice = 250,
    selectedSeats = [],
    onSeatClick
}) => {
    const groupedTiers = useMemo(() => {
        const tiersMap = new Map()

        seats.forEach((seat) => {
            const tierName = seat.tier || "Standard"
            const seatPrice = seat.price || ticketPrice
            const rowLabel = seat.seatNumber?.charAt(0) || "A"

            if (!tiersMap.has(tierName)) {
                tiersMap.set(tierName, {
                    name: tierName,
                    price: seatPrice,
                    rows: {}
                })
            }

            const currentTier = tiersMap.get(tierName)
            if (!currentTier.rows[rowLabel]) {
                currentTier.rows[rowLabel] = []
            }
            currentTier.rows[rowLabel].push(seat)
        })

        return Array.from(tiersMap.values()).map((tier) => {
            const sortedRows = Object.entries(tier.rows)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([rowLabel, rowSeats]) => {
                    const sortedSeats = [...rowSeats].sort((a, b) => {
                        const colA = a.col ?? parseInt(a.seatNumber.substring(1), 10) ?? 0
                        const colB = b.col ?? parseInt(b.seatNumber.substring(1), 10) ?? 0
                        return colA - colB
                    })
                    return { rowLabel, seats: sortedSeats }
                })

            return {
                ...tier,
                rows: sortedRows
            }
        })
    }, [seats, ticketPrice])

    return (
        <div className="seat-grid-container">
            {groupedTiers.map((tier) => (
                <div key={tier.name} className="seat-tier-section">
                    <div className="seat-tier-header">
                        <span className="seat-tier-badge">
                            ₹{tier.price} {tier.name}
                        </span>
                    </div>

                    <div className="seat-tier-rows">
                        {tier.rows.map(({ rowLabel, seats: rowSeats }) => (
                            <div key={rowLabel} className="seat-row">
                                <span className="seat-row-label">{rowLabel}</span>
                                {rowSeats.map((seat, index) => {
                                    const isChosen = selectedSeats.some((s) => s.seatNumber === seat.seatNumber)
                                    const isUnavailable =
                                        seat.status === "booked" ||
                                        seat.status === "reserved" ||
                                        seat.status === "locked"

                                    let seatClass = "seat-item available"
                                    if (isUnavailable) seatClass = "seat-item booked"
                                    if (isChosen) seatClass = "seat-item selected"

                                    const prevSeat = rowSeats[index - 1]
                                    const prevCol = prevSeat
                                        ? (prevSeat.col ?? parseInt(prevSeat.seatNumber.substring(1), 10))
                                        : null
                                    const currentCol = seat.col ?? parseInt(seat.seatNumber.substring(1), 10)
                                    const hasAisleGap = prevCol !== null && currentCol - prevCol > 1

                                    return (
                                        <React.Fragment key={seat._id || seat.seatNumber}>
                                            {hasAisleGap && <span className="seat-aisle-gap" />}
                                            <button
                                                type="button"
                                                onClick={() => onSeatClick(seat)}
                                                disabled={isUnavailable}
                                                className={seatClass}
                                                title={`${seat.seatNumber} - ₹${seat.price || tier.price}`}
                                            >
                                                {seat.seatNumber.substring(1)}
                                            </button>
                                        </React.Fragment>
                                    )
                                })}
                                <span className="seat-row-label">{rowLabel}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default BookingSeatMatrix