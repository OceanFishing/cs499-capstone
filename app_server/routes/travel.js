const express = require('express');
const router = express.Router();
const travelController = require('../controllers/travel');

/* Map GET /travel to the travel controller */
router.get('/', travelController.travel);

/* Map GET /travel/:tripCode to the travelDetail controller */
router.get('/:tripCode', travelController.travelDetail);

module.exports = router;