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
                        const colA = a.col ?? parseInt(a.seatNumber.replace(/\D/g, ""), 10) ?? 0
                        const colB = b.col ?? parseInt(b.seatNumber.replace(/\D/g, ""), 10) ?? 0
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

    const isAisleBoundary = (index, totalSeats, prevCol, currentCol) => {
        if (prevCol !== null && currentCol - prevCol > 1) return true
        if (totalSeats >= 12) {
            return index === 2 || index === totalSeats - 3
        }
        if (totalSeats >= 8) {
            return index === Math.floor(totalSeats / 2) - 1
        }
        return false
    }

    return (
        <div className="seat-grid-container">
            {groupedTiers.map((tier) => (
                <div key={tier.name} className="seat-tier-section">
                    <div className="seat-tier-header">
                        <span className="seat-tier-badge">
                            ₹{tier.price} &nbsp;•&nbsp; {tier.name}
                        </span>
                    </div>

                    <div className="seat-tier-rows">
                        {tier.rows.map(({ rowLabel, seats: rowSeats }) => (
                            <div key={rowLabel} className="seat-row">
                                <span className="seat-row-label">{rowLabel}</span>

                                <div className="seat-row-units">
                                    {rowSeats.map((seat, index) => {
                                        const isChosen = selectedSeats.some(
                                            (s) => (s.seatNumber || s) === seat.seatNumber
                                        )
                                        const isUnavailable =
                                            seat.status === "booked" ||
                                            seat.status === "reserved" ||
                                            seat.status === "locked"

                                        let seatClass = "cinema-seat-box available"
                                        if (isUnavailable) seatClass = "cinema-seat-box booked"
                                        if (isChosen) seatClass = "cinema-seat-box selected"

                                        const prevSeat = rowSeats[index - 1]
                                        const prevCol = prevSeat
                                            ? (prevSeat.col ?? parseInt(prevSeat.seatNumber.replace(/\D/g, ""), 10))
                                            : null
                                        const currentCol = seat.col ?? parseInt(seat.seatNumber.replace(/\D/g, ""), 10)
                                        const hasAisle = isAisleBoundary(index, rowSeats.length, prevCol, currentCol)

                                        return (
                                            <React.Fragment key={seat._id || seat.seatNumber}>
                                                <button
                                                    type="button"
                                                    onClick={() => onSeatClick(seat)}
                                                    disabled={isUnavailable}
                                                    className={seatClass}
                                                    title={`${seat.seatNumber} — ₹${seat.price || tier.price}`}
                                                >
                                                    <span className="seat-headrest" />
                                                    <span className="seat-number-text">
                                                        {seat.seatNumber.replace(/\D/g, "")}
                                                    </span>
                                                </button>
                                                {hasAisle && <span className="seat-aisle-spacer" />}
                                            </React.Fragment>
                                        )
                                    })}
                                </div>

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