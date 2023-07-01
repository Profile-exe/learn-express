const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error'); // 404페이지를 위한 controller
const sequelize = require('./util/database');

const app = express();

app.set('view engine', 'pug');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  /* User.findByPk(1)
    .then((user) => {
      req.user = user; // req 객체에 담으면 다음 미들웨어에서 접근 가능
      next(); // 전역? 미들웨어 등록했으면 next()를 호출해 다음 미들웨어로 접근할 수 있도록 해야함
    })
    .catch((err) => console.log(err)); */
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(3000);
