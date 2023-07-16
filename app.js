const path = require('path');

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session'); // 세션을 위한 미들웨어
const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error'); // 404페이지를 위한 controller

const { User } = require('./models/user');

const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWD}@cluster0.kpdkhqt.mongodb.net/${process.env.DB_NAME}`;

const app = express();

app.set('view engine', 'pug');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

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

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  // ?retryWrites=true&w=majority 는 mongodb atlas에서 connection string을 얻을 때 붙는 부분이다.
  .connect(MONGODB_URI + '?retryWrites=true&w=majority')
  .then(async (result) => {
    let user = await User.findOne({ name: 'dding' });

    if (!user) {
      user = new User({
        name: 'dding',
        email: 'dding@test.com',
        cart: {
          items: [],
        },
      });

      user.save();
    }
    console.log('Connected!');
    app.listen(3000);
  })
  .catch((err) => console.log(err));
