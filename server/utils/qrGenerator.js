const QRCode = require("qrcode")

const generateTicketQR = async (bookingData) => {
    try {
        const payload = JSON.stringify({
            bookingId: bookingData._id,
            userId: bookingData.user,
            showtimeId: bookingData.showtime,
            seats: bookingData.seatsBooked,
            validDate: new Date().toISOString()
        })
        const qrCodeImage = await QRCode.toDataURL(payload)
        return qrCodeImage
    } catch (err) {
        throw new Error("Failed to generate ticket QR Code")
    }
}

module.exports = generateTicketQR