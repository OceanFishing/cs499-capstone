const mongoose = require('mongoose');
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

/* POST /api/trips -- adds a new trip */
const tripsAddTrip = async (req, res) => {
  try {
    const newTrip = new Trip({
      code: req.body.code,
      name: req.body.name,
      length: req.body.length,
      start: req.body.start,
      resort: req.body.resort,
      perPerson: req.body.perPerson,
      image: req.body.image,
      description: req.body.description
    });
    const q = await newTrip.save();
    if (!q) {
      return res.status(400).json(err);
    } else {
      return res.status(201).json(q);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
};

/* PUT /api/trips/:tripCode -- updates a single trip */
const tripsUpdateTrip = async (req, res) => {
  console.log(req.params);
  console.log(req.body);
  const q = await Trip
    .findOneAndUpdate(
      { 'code': req.params.tripCode },
      {
        code: req.body.code,
        name: req.body.name,
        length: req.body.length,
        start: req.body.start,
        resort: req.body.resort,
        perPerson: req.body.perPerson,
        image: req.body.image,
        description: req.body.description
      }
    )
    .exec();
  if (!q) {
    return res.status(400).json(err);
  } else {
    return res.status(201).json(q);
  }
};

module.exports = { tripsList, tripsFindByCode, tripsAddTrip, tripsUpdateTrip };