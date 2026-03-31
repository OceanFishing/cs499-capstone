const express = require('express');
const router = express.Router();

// Import controller functions for trip-related endpoints
const tripsController = require('../controllers/trips');

// Route: GET all trips
router.get('/trips', tripsController.tripsList);

// Route: GET a specific trip by its tripCode parameter
router.get('/trips/:tripCode', tripsController.tripsFindByCode);

module.exports = router;