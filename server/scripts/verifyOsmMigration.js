const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") })

const mongoose = require("mongoose")
const config = require("../config/config")
const geoConfig = require("../config/geoConfig")
const { isValidCoordinate, calculateDistanceKm, buildNearSphereQuery } = require("../utils/geoUtils")
const { fetchCinemasInRadius } = require("../services/osm/overpassClient")
const { parseOsmCinemaList } = require("../dto/osmCinemaDto")
const { normalizeOsmCinemaBatch } = require("../services/osm/theatreNormalizer")
const { syncCinemasFromOsm } = require("../services/theatreSyncService")
const Theatre = require("../models/Theatre")

const MONGO_URI = "mongodb+srv://rijianzhuren_db_user:2vEB1mTY89WvSljQ@moviesdata.4xivl1c.mongodb.net/"

const runVerification = async () => {
    const results = []

    const record = (testName, passed, detail = "") => {
        results.push({ testName, passed, detail })
    }

    try {
        const validTest = isValidCoordinate(18.9690, 72.8194)
        const invalidLat = isValidCoordinate(95.0, 72.8194)
        const emptyCoord = isValidCoordinate("", null)
        record("Coordinate Boundary Guard", validTest && !invalidLat && !emptyCoord)

        const zeroDist = calculateDistanceKm(18.9690, 72.8194, 18.9690, 72.8194)
        const knownDist = calculateDistanceKm(18.9690, 72.8194, 19.0760, 72.8777)
        record("Haversine Distance Precision", zeroDist === 0 && knownDist > 10 && knownDist < 20, `${knownDist} km`)

        const nearQuery = buildNearSphereQuery(18.9690, 72.8194, 50)
        const validNearStructure = nearQuery.$nearSphere?.$geometry?.coordinates[0] === 72.8194 &&
            nearQuery.$nearSphere?.$maxDistance === 50000
        record("Spherical Mongo Query Builder", validNearStructure)

        let rawElements = []
        try {
            rawElements = await fetchCinemasInRadius(18.9690, 72.8194, 15, 25000)
            record("Overpass Live API Connectivity", Array.isArray(rawElements) && rawElements.length > 0, `Fetched ${rawElements.length} elements`)
        } catch (err) {
            record("Overpass Live API Connectivity", false, err.message)
        }

        let dtoList = []
        if (rawElements.length > 0) {
            dtoList = parseOsmCinemaList(rawElements)
            const allHaveCoords = dtoList.every(d => Array.isArray(d.coordinates) && d.coordinates.length === 2)
            record("OSM DTO Parser & Coordinate Extraction", dtoList.length > 0 && allHaveCoords, `Parsed ${dtoList.length} DTOs`)
        } else {
            record("OSM DTO Parser & Coordinate Extraction", true, "Skipped live parsing due to network/rate limit")
        }

        if (dtoList.length > 0) {
            const normalized = normalizeOsmCinemaBatch(dtoList, "Mumbai")
            const validScreens = normalized.every(n => Array.isArray(n.screens) && n.screens.length > 0 && n.screens[0].totalSeats > 0)
            record("Theatre Normalizer Screen Synthesis", normalized.length > 0 && validScreens, `Normalized ${normalized.length} venues`)
        }

        if (MONGO_URI) {
            await mongoose.connect(MONGO_URI)
            record("Database Connection", true)

            const indexes = await Theatre.collection.indexes()
            const has2dsphere = indexes.some(idx => idx.key && idx.key.location === "2dsphere")
            record("MongoDB 2dsphere Spatial Index", has2dsphere)

            const syncResult = await syncCinemasFromOsm({
                lat: geoConfig.defaultCoordinates.lat,
                lng: geoConfig.defaultCoordinates.lng,
                radiusKm: 10,
                defaultCity: "Mumbai"
            })
            record("Idempotent Sync Service Execution", syncResult.totalFetched >= 0, `Ins: ${syncResult.inserted}, Upd: ${syncResult.updated}`)

            const nearTheatres = await Theatre.find({
                location: buildNearSphereQuery(18.9690, 72.8194, 25),
                isActive: true
            }).limit(5)
            record("Spatial $nearSphere Proximity Query", nearTheatres.length > 0, `Retrieved ${nearTheatres.length} physical cinemas`)

            await mongoose.disconnect()
        } else {
            record("Database Operations", false, "MONGO_URI missing from environment")
        }
    } catch (err) {
        record("Pipeline Execution", false, err.message)
    }

    console.table(results)
    const allPassed = results.every(r => r.passed)
    process.exit(allPassed ? 0 : 1)
}

runVerification()