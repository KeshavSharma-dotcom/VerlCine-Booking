const express = require('express')
const router = express.Router()

const authRoutes = require('./authRoutes')
const otpRoutes = require('./otpRoutes')
const userRoutes = require('./userRoutes')
const movieRoutes = require('./movieRoutes')

router.use('/auth', authRoutes)
router.use('/otp', otpRoutes)
router.use('/users', userRoutes)
router.use('/movies', movieRoutes)

module.exports = router