const path = require('path');

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error'); // 404페이지를 위한 controller

const { User } = require('./models/user');

const app = express();

app.set('view engine', 'pug');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
  const user = await User.findOne({ name: 'dding' });

  req.user = user;
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWD}@cluster0.kpdkhqt.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
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

    app.listen(3000);
  })
  .catch((err) => console.log(err));
