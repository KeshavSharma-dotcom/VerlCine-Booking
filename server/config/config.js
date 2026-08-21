const dotenv = require("dotenv")

dotenv.config()

module.exports = {
    app: {
        port: process.env.PORT || 5000,
        clientUrl: "http://localhost:5173"
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET,
        salt: process.env.SALT || 10,
        emailRegex : /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    db: {
        mongoUrl: process.env.MONGO_URL,
    },
    email: {
        emailId: process.env.EMAIL_USER,
        emailPass: process.env.EMAIL_PASS,
        emailHost: process.env.EMAIL_HOST
    }
}