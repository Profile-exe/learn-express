const express = require('express');
const { check, body } = require('express-validator');
const bcrypt = require('bcryptjs');

const authController = require('../controllers/auth');
const { User } = require('../models/user');

const emailValidator = (fieldName, signupOrlogin) => {
  return check(fieldName)
    .notEmpty()
    .withMessage('Please fill in')
    .isEmail()
    .withMessage('Please enter a valid Email')
    .normalizeEmail()
    .custom(async (value) => {
      const userDoc = await User.findOne({ email: value });
      switch (signupOrlogin) {
        case 'signup':
          if (userDoc) {
            throw new Error(
              'E-Mail exists already, please pick a different one.'
            );
          }
          break;
        case 'login':
          if (!userDoc) {
            throw new Error('Invalid email!');
          }
          break;
        default:
          throw new Error('Invalid way to email validation!');
      }
    });
};

const validators = {
  signupEmail: emailValidator('email', 'signup'),

  loginEmail: emailValidator('email', 'login'),

  loginPassword: body('password')
    .trim()
    .custom(async (value, { req }) => {
      const { email } = req.body;
      const user = await User.findOne({ email });
      const doMatch = await bcrypt.compare(value, user.password);

      if (!doMatch) {
        throw new Error('Invalid password!');
      }

      req.user = user;
    }),

  signupPassword: body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 characters long.')
    .isAlphanumeric()
    .withMessage('Password must contain only letters and numbers.'),

  confirmPassword: body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Confirm password is required.')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords have to match!'),
};

const router = express.Router();

router
  .route('/login')
  .get(authController.getLogin)
  .post(
    [validators.loginEmail, validators.loginPassword],
    authController.postLogin
  );

router.post('/logout', authController.postLogout);

router
  .route('/signup')
  .get(authController.getSignup)
  .post(
    [
      validators.signupEmail,
      validators.signupPassword,
      validators.confirmPassword,
    ],
    authController.postSignup
  );

router
  .route('/reset')
  .get(authController.getReset)
  .post(authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
