const Model = require('../models/travlr');

/* GET /api/trips - returns all trips */
const tripsList = async (req, res) => {
    try {
        const q = await Model.find({});
        if (!q) {
            return res.status(404).json({ message: 'No trips found' });
        }
        res.status(200).json(q);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* GET /api/trips/:tripCode - returns a single trip by code */
const tripsFindByCode = async (req, res) => {
    try {
        const q = await Model.findOne({ code: req.params.tripCode });
        if (!q) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        res.status(200).json(q);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* POST /api/trips - adds a new trip */
const tripsAddTrip = async (req, res) => {
    try {
        const q = await Model.create({
            code: req.body.code,
            name: req.body.name,
            length: req.body.length,
            start: req.body.start,
            resort: req.body.resort,
            perPerson: req.body.perPerson,
            image: req.body.image,
            description: req.body.description
        });
        if (!q) {
            return res.status(400).json({ message: 'Failed to create trip' });
        }
        res.status(201).json(q);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* PUT /api/trips/:tripCode - updates an existing trip by code */
const tripsUpdateTrip = async (req, res) => {
    try {
        const q = await Model.findOneAndUpdate(
            { code: req.params.tripCode },
            {
                code: req.body.code,
                name: req.body.name,
                length: req.body.length,
                start: req.body.start,
                resort: req.body.resort,
                perPerson: req.body.perPerson,
                image: req.body.image,
                description: req.body.description
            },
            { new: true }
        );
        if (!q) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        res.status(200).json(q);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    tripsList,
    tripsFindByCode,
    tripsAddTrip,
    tripsUpdateTrip
};