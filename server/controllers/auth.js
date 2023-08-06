const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const { User } = require('../models/user');

module.exports = {
  async signup(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422; // Unprocessable Entity
      error.data = errors.array();
      return next(error);
    }

    const { email, name, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        email,
        password: hashedPassword,
        name,
      });

      const result = await user.save();

      res.status(201).json({
        message: 'User created!',
        userId: result._id,
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      return next(err);
    }
  },

  async login(req, res, next) {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        const error = new Error('A user with this email could not be found.');
        error.statusCode = 401; // Unauthorized
        return next(error);
      }

      const isEqual = await bcrypt.compare(password, user.password);

      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 401; // Unauthorized
        return next(error);
      }

      const token = jwt.sign(
        { email: user.email, userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(200).json({ token, userId: user._id.toString() });
    } catch (err) {}
  },
};
