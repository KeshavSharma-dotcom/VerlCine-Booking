const express = require("express")
require("dotenv").config()
const connectDB = require("./config/db")
const helmet = require("helmet")
const errorHandler = require("./middleware/errorHandler")
const app = express()
connectDB()

app.use(helmet())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    res.status(404)
    next(error)
})

app.use(errorHandler)

const port = process.env.PORT
app.listen(port, () => {
    console.log(`Server connected on ${port}`)
})