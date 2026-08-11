const { Server } = require("socket.io")
const Showtime = require("../models/Showtime")

const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            credentials: true
        }
    })

    io.on("connection", (socket) => {
        socket.on("joinShowtimeRoom", (showtimeId) => {
            socket.join(showtimeId)
        })

        socket.on("lockSeat", async ({ showtimeId, seatNumber, userId }) => {
            try {
                const lockDuration = 10 * 60 * 1000
                const lockedUntil = new Date(Date.now() + lockDuration)

                const showtime = await Showtime.findById(showtimeId)
                if (!showtime) return

                const currentlyLockedSeat = showtime.seats.find(
                    (s) => s.lockedBy?.toString() === userId && s.status === "locked"
                )

                if (currentlyLockedSeat && currentlyLockedSeat.seatNumber !== seatNumber) {
                    currentlyLockedSeat.status = "available"
                    currentlyLockedSeat.lockedBy = null
                    currentlyLockedSeat.lockedUntil = null

                    io.to(showtimeId).emit("seatStatusUpdated", {
                        seatNumber: currentlyLockedSeat.seatNumber,
                        status: "available",
                        lockedBy: null
                    })
                }

                const targetSeat = showtime.seats.find((s) => s.seatNumber === seatNumber)
                if (!targetSeat) return

                if (targetSeat.status === "booked") {
                    return socket.emit("seatLockFailed", { seatNumber, message: "Seat already booked" })
                }

                if (
                    targetSeat.status === "locked" &&
                    targetSeat.lockedBy?.toString() !== userId &&
                    targetSeat.lockedUntil > new Date()
                ) {
                    return socket.emit("seatLockFailed", { seatNumber, message: "Seat currently locked by another user" })
                }

                targetSeat.status = "locked"
                targetSeat.lockedBy = userId
                targetSeat.lockedUntil = lockedUntil
                await showtime.save()

                io.to(showtimeId).emit("seatStatusUpdated", {
                    seatNumber,
                    status: "locked",
                    lockedBy: userId
                })
            } catch (err) {
                socket.emit("seatLockError", { message: err.message })
            }
        })

        socket.on("unlockSeat", async ({ showtimeId, seatNumber, userId }) => {
            try {
                const showtime = await Showtime.findById(showtimeId)
                if (!showtime) return

                const targetSeat = showtime.seats.find((s) => s.seatNumber === seatNumber)
                if (targetSeat && targetSeat.lockedBy?.toString() === userId && targetSeat.status === "locked") {
                    targetSeat.status = "available"
                    targetSeat.lockedBy = null
                    targetSeat.lockedUntil = null
                    await showtime.save()

                    io.to(showtimeId).emit("seatStatusUpdated", {
                        seatNumber,
                        status: "available",
                        lockedBy: null
                    })
                }
            } catch (err) {
                socket.emit("seatLockError", { message: err.message })
            }
        })
    })

    return io
}

module.exports = initSocket