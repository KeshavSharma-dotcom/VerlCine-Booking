const http = require("http")
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const helmet = require("helmet")

const config = require("./config/config")
const connectDB = require("./config/db")
const errorHandler = require("./middleware/errorHandler")
const dataSan = require("./middleware/dataSan")
const initSocket = require("./utils/socket")
const startReminderScheduler = require("./utils/reminderScheduler")

const authRoutes = require("./routes/authRoutes")
const movieRoutes = require("./routes/movieRoutes")

const app = express()
const server = http.createServer(app)

connectDB()
initSocket(server)
startReminderScheduler()

app.use(helmet())

const corsOptions = {
    origin: config.app.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}

app.use(cors(corsOptions))

app.use(cookieParser())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(dataSan)

app.use("/api/auth", authRoutes)
app.use("/api/movies", movieRoutes)

app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    error.statusCode = 404
    next(error)
})

app.use(errorHandler)

const PORT = config.app.port || 5000
const runningServer = server.listen(PORT, () => {
    console.log(`Server connected on port ${PORT}`)
})

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err)
    runningServer.close(() => process.exit(1))
})

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err)
    runningServer.close(() => process.exit(1))
})