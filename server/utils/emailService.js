const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, "../.env") })
const nodemailer = require("nodemailer")

const sendEmail = async (options) => {
    const user = process.env.EMAIL_USER
    const pass = process.env.EMAIL_PASS

    if (!user || !pass) {
        throw new Error("SMTP credentials are not set in environment variables")
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user,
            pass
        }
    })

    const mailOptions = {
        from: `CineVerl <${process.env.EMAIL_FROM || user}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || `<p>${options.message}</p>`
    }

    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail