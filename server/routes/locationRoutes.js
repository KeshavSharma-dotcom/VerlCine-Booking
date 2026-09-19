const express = require("express")
const router = express.Router()
const {
    getAlphabetList,
    getPopularCities,
    getAllIndianCities,
    getTheatresUnder40Km
} = require("../controller/locationController")

router.get("/alphabets", getAlphabetList)
router.get("/popular-cities", getPopularCities)
router.get("/cities", getAllIndianCities)
router.get("/theatres-nearby", getTheatresUnder40Km)

module.exports = router