const express = require('express');
const router = express.Router();

const tripsController = require('../controllers/trips');

// GET and POST for the trips collection
router.route('/trips')
  .get(tripsController.tripsList)
  .post(tripsController.tripsAddTrip);

// GET and PUT for a specific trip by tripCode
router.route('/trips/:tripCode')
  .get(tripsController.tripsFindByCode)
  .put(tripsController.tripsUpdateTrip);

module.exports = router;