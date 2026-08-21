const config = require("./config")
const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        await mongoose.connect(config.db.mongoUrl)
        console.log("DB connected")
    } catch (err) {
        console.error("DB connection failed!", err.message)
    }
}
module.exports = connectDB