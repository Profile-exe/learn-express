const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const { User } = require('../models/user');

// sendgridTransport를 통해 nodemailer를 설정
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

module.exports = {
  getLogin: (req, res, next) => {
    res.render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      oldInput: { email: '', password: '' },
    });
  },

  postLogin: async (req, res, next) => {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: errors.array()[0].msg,
        oldInput: { email, password },
        validationErrors: errors.array(),
      });
    }

    try {
      const user = req.user;

      req.session.user = user;
      req.session.isLoggedIn = true;
      // 세션에 데이터가 저장되기 전에 리다이렉트가 발생할 수 있음
      // 따라서 명시적으로 save()를 호출하여 세션에 저장이 끝난 후 리다이렉트
      req.session.save((err) => {
        console.log('Session saved', err);
        res.redirect('/');
      });
    } catch (err) {
      const error = new Error(err);
      console.log('postLogin error', err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },

  postLogout: (req, res, next) => {
    // destroy()를 통해 세션을 지울 수 있지만 세션 쿠키는 남아있음
    // 이 쿠키에 대응하는 세션이 존재하지 않기 때문에 문제는 없음
    // 세션이 재생성시 세션 쿠키는 새로운 값으로 덮어씌워짐
    // 세션쿠키는 Expires, maxAge 등을 설정하지 않은 상태에선 브라우저를 닫아야 사라짐
    req.session.destroy((err) => {
      console.log('Session destroyed', err);
      res.redirect('/');
    });
  },

  getSignup: (req, res, next) => {
    res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      oldInput: { email: '', password: '', confirmPassword: '' },
    });
  },

  postSignup: async (req, res, next) => {
    const { email, password, confirmPassword } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('errors array:', errors.array());

      return res.status(422).render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: errors.array()[0].msg,
        oldInput: { email, password, confirmPassword },
        validationErrors: errors.array(),
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        email,
        password: hashedPassword,
        cart: {
          items: [],
        },
      });

      await user.save();

      transporter.sendMail({
        to: email,
        from: 'shop@node-complete.com',
        subject: 'Signup succeeded!',
        html: `<h1>You successfully signed up!</h1>`,
      });

      res.redirect('/login');
    } catch (err) {
      const error = new Error(err);
      console.log('postSignup error', err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },

  getReset: (req, res, next) => {
    res.render('auth/reset', {
      path: '/reset',
      pageTitle: 'Reset Password',
    });
  },

  postReset: async (req, res, next) => {
    try {
      const buffer = await crypto.randomBytes(32);
      const token = buffer.toString('hex');

      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        req.flash('error', 'No account with that email found!');
        return res.redirect('/reset');
      }

      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 60 * 60 * 1000; // 1 hour: 밀리초 단위

      console.dir(user);

      await user.save();

      transporter.sendMail({
        to: email,
        from: 'shop@node-complete.com',
        subject: 'Password reset',
        html: `
          <p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
        `,
      });

      res.redirect('/');
    } catch (err) {
      const error = new Error(err);
      console.log('postReset error', err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },

  getNewPassword: async (req, res, next) => {
    const token = req.params.token;

    try {
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
      });

      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        passwordToken: token,
        userId: user._id.toString(),
      });
    } catch (err) {
      const error = new Error(err);
      console.log('getNewPassword error', err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },

  postNewPassword: async (req, res, next) => {
    const { userId, newPassword, passwordToken } = req.body;

    try {
      const user = await User.findOne({
        _id: userId,
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
      });

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;

      await user.save();

      res.redirect('/login');
    } catch (err) {
      const error = new Error(err);
      console.log('postNewPassword error', err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },
};
