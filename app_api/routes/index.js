const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const tripsController = require('../controllers/trips');
const authController = require('../controllers/authentication');

/* Middleware to authenticate JWT on protected routes */
function authenticateJWT(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (authHeader == null) {
        console.log('Auth Header Required but NOT PRESENT!');
        return res.sendStatus(401);
    }

    let headers = authHeader.split(' ');
    if (headers.length < 1) {
        console.log('Not enough tokens in Auth Header: ' + headers.length);
        return res.sendStatus(501);
    }

    const token = authHeader.split(' ')[1];

    if (token == null) {
        console.log('Null Bearer Token');
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
        if (err) {
            return res.sendStatus(401).json('Token Validation Error!');
        }
        req.auth = verified; // set the auth param to the decoded object
        next(); // continue or this will hang forever
    });
}

/* POST /api/login - authenticate user and return JWT */
router
    .route('/login')
    .post(authController.login);

/* POST /api/register - create new user and return JWT */
router
    .route('/register')
    .post(authController.register);

/* GET /api/trips - returns all trips */
/* POST /api/trips - adds a new trip, requires authentication */
router
    .route('/trips')
    .get(tripsController.tripsList)
    .post(authenticateJWT, tripsController.tripsAddTrip);

/* GET /api/trips/:tripCode - returns a single trip by code */
/* PUT /api/trips/:tripCode - updates a trip, requires authentication */
router
    .route('/trips/:tripCode')
    .get(tripsController.tripsFindByCode)
    .put(authenticateJWT, tripsController.tripsUpdateTrip);

module.exports = router;