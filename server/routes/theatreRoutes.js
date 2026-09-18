const express = require("express")
const router = express.Router()
const { protect, requireRole, requireTheatreAccess } = require("../middleware/verifyRole")
const {
    getAllTheatres,
    getNearbyTheatres,
    getTheatreById,
    createTheatre,
    updateTheatre,
    deleteTheatre,
    getDistinctCities,
    triggerOsmSync
} = require("../controller/theatreController")

router.get("/cities", getDistinctCities)
router.get("/nearby", getNearbyTheatres)
router.get("/", getAllTheatres)
router.get("/:id", getTheatreById)

router.post("/sync-osm", protect, requireRole("admin"), triggerOsmSync)
router.post("/", protect, requireRole("admin"), createTheatre)
router.put("/:id", protect, requireTheatreAccess, updateTheatre)
router.delete("/:id", protect, requireRole("admin"), deleteTheatre)

module.exports = router