const fs = require('fs'); // Node built-in filesystem module
const path = require('path'); // Node built-in path utility

/* Read trips from the JSON data file */
const tripsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/trips.json'), 'utf8')
);

/* GET travel page - passes trips array to HBS view */
const travel = (req, res) => {
  res.render('travel', { title: 'Travlr Getaways', trips: tripsData });
};

module.exports = { travel };