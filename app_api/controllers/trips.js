const mongoose = require('mongoose');
// Trip model registered by db.js on startup
const Trip = mongoose.model('trips');

/* GET /api/trips -- returns all trips */
const tripsList = async (req, res) => {
  try {
    const trips = await Trip.find({});
    if (!trips) {
      return res.status(404).json({ message: 'trips not found' });
    }
    return res.status(200).json(trips);
  } catch (err) {
    return res.status(404).json(err);
  }
};

/* GET /api/trips/:tripCode -- returns a single trip by tripCode */
const tripsFindByCode = async (req, res) => {
  try {
    const trips = await Trip.find({ 'code': req.params.tripCode });
    if (!trips) {
      return res.status(404).json({ message: 'trips not found' });
    }
    return res.status(200).json(trips);
  } catch (err) {
    return res.status(404).json(err);
  }
};

module.exports = { tripsList, tripsFindByCode };