// Bring in the DB connection and the Trip schema
const Mongoose = require('./db');
const Trip = require('./travlr');

const fs = require('fs');

// Read seed data from the JSON file
var trips = JSON.parse(fs.readFileSync('./data/trips.json', 'utf8'));

// Delete all existing records, then insert fresh seed data
const seedDB = async () => {
    await Trip.deleteMany({});    // wipe existing trips to avoid duplicates
    await Trip.insertMany(trips); // insert all trips from JSON
};

// Close the MongoDB connection and exit cleanly after seeding
seedDB().then(async () => {
    await Mongoose.connection.close();
    process.exit(0);
});