const dotenv = require("dotenv")

dotenv.config()

module.exports = {
    port: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET,
    mongoUrl: process.env.MONGO_URL,
    salt: process.env.SALT || 10
}