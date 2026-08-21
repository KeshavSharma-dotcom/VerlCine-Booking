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
app.use(
    cors({
        origin: config.app.clientUrl,
        credentials: true
    })
)
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(dataSan)

app.use("/api/auth", authRoutes)
app.use("/api/movies", movieRoutes)

app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    res.status(404)
    next(error)
})

app.use(errorHandler)

server.listen(config.app.port, () => {
    console.log(`Server connected on port ${config.app.port}`)
})