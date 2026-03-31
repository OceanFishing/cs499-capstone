const mongoose = require('mongoose');

// Define the trip schema with validation and indexing
const tripSchema = new mongoose.Schema({
    code:        { type: String, required: true, index: true },  // unique trip code, indexed for fast lookup
    name:        { type: String, required: true, index: true },  // trip name, indexed for search
    length:      { type: String, required: true },
    start:       { type: Date,   required: true },               // ISO date format
    resort:      { type: String, required: true },
    perPerson:   { type: String, required: true },
    image:       { type: String, required: true },
    description: { type: String, required: true }
});

// Register the model against the 'trips' collection
const Trip = mongoose.model('trips', tripSchema);

module.exports = Trip;