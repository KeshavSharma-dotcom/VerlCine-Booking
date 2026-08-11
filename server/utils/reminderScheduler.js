const cron = require("node-cron")
const Booking = require("../models/Booking")
const sendEmail = require("./emailService")

const startReminderScheduler = () => {
    cron.schedule("*/15 * * * *", async () => {
        try {
            const now = new Date()
            const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)

            const upcomingBookings = await Booking.find({
                reminderSent: false,
                status: "confirmed"
            })
                .populate("user", "email name")
                .populate({
                    path: "showtime",
                    populate: { path: "movie", select: "title" }
                })

            for (const booking of upcomingBookings) {
                if (booking.showtime && booking.showtime.startTime >= now && booking.showtime.startTime <= twoHoursLater) {
                    const emailOptions = {
                        email: booking.user.email,
                        subject: `Upcoming Movie Reminder: ${booking.showtime.movie.title}`,
                        message: `Hello ${booking.user.name}, your show for "${booking.showtime.movie.title}" starts in less than 2 hours! Seats: ${booking.seatsBooked.join(", ")}.`
                    }

                    await sendEmail(emailOptions)
                    booking.reminderSent = true
                    await booking.save()
                }
            }
        } catch (err) {
            console.error("Error in reminder scheduler", err.message)
        }
    })
}

module.exports = startReminderScheduler