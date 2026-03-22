const express = require('express');
const router = express.Router();
const travelController = require('../controllers/travel'); // import travel controller

/* Map GET /travel to the travel controller */
router.get('/', travelController.travel);

module.exports = router;