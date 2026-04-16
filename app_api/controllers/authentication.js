const passport = require('passport');
const mongoose = require('mongoose');
const User = require('../models/user');

/* POST /api/register - validates fields, creates user, returns JWT */
const register = async (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res
            .status(400)
            .json({ message: 'All fields required' });
    }

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: ''
    });

    user.setPassword(req.body.password);
    const q = await user.save();

    if (!q) {
        return res
            .status(400)
            .json({ err });
    } else {
        const token = user.generateJWT();
        return res
            .status(200)
            .json({ token });
    }
};

/* POST /api/login - delegates to passport, returns JWT on success */
const login = (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res
            .status(400)
            .json({ message: 'All fields required' });
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            /* Error in authentication process */
            return res
                .status(404)
                .json(err);
        }

        if (user) {
            /* Auth succeeded - generate JWT and return to caller */
            const token = user.generateJWT();
            res
                .status(200)
                .json({ token });
        } else {
            /* Auth failed - return error info */
            res
                .status(401)
                .json(info);
        }
    })(req, res);
};

module.exports = {
    register,
    login
};