const path = require('path');

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session'); // 세션을 위한 미들웨어
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf'); // csrf 공격 방지를 위한 미들웨어
const flash = require('connect-flash'); // 플래시 메시지를 위한 미들웨어

const morgan = require('morgan'); // 로그를 위한 미들웨어

const errorController = require('./controllers/error'); // 404페이지를 위한 controller

const { User } = require('./models/user');

const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWD}@cluster0.kpdkhqt.mongodb.net/${process.env.DB_NAME}`;

const app = express();

app.set('view engine', 'pug');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const isAuth = require('./middleware/is-auth');

const csrfProtection = csrf();

// app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    store: new MongoDBStore({
      uri: MONGODB_URI,
      collection: 'sessions',
    }),
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(csrfProtection); // csrf 패키지가 세션을 사용하므로 세션 미들웨어 뒤에 위치해야 함
app.use(flash()); // 플래시 메시지를 사용하기 위한 미들웨어

// 세션 미들웨어 이후에 존재하므로 세션에 접근 가능
// 세션에 user가 존재하면 req.user에 user를 넣어줌
app.use(async (req, res, next) => {
  try {
    if (req.session.user) {
      const user = await User.findById(req.session.user._id);
      req.user = user;
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.use((req, res, next) => {
  // res.locals는 view engine에서 사용할 수 있는 변수를 설정하는 객체
  res.locals = {
    csrfToken: req.csrfToken(), // csrf 토큰을 모든 뷰에 전달
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: req.flash('error'),
    validationErrors: [],
  };
  next();
});

app.use('/admin', isAuth, adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  // ?retryWrites=true&w=majority 는 mongodb atlas에서 connection string을 얻을 때 붙는 부분이다.
  .connect(MONGODB_URI + '?retryWrites=true&w=majority')
  .then(async (result) => {
    console.log('DB Connected!');

    const server = app.listen(3000);

    server.keepAliveTimeout = 61 * 1000;
    server.headersTimeout = 61 * 1.5 * 1000;
  })
  .catch((err) => console.log(err));
