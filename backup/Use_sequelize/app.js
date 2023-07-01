const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error'); // 404페이지를 위한 controller
const sequelize = require('./util/database');

const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();

app.set('view engine', 'pug');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * 아래 코드는 미들웨어를 "등록" 할 뿐.
 * 즉, 등록한 익명함수는 요청이 들어오지 않는 이상 실행되지 않음
 *
 * 맨 아래 app.listen() 함수가 새로운 유저를 생성 후 호출되므로
 * 어떠한 새로운 요청이 오더라도
 * 지금 등록되어있는 이 익명함수에서 findByPk(1)는 무조건 사용자 반환
 */
app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user; // req 객체에 담으면 다음 미들웨어에서 접근 가능
      next(); // 전역? 미들웨어 등록했으면 next()를 호출해 다음 미들웨어로 접근할 수 있도록 해야함
    })
    .catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// constraints: 외래 키 제약 조건을 활성화
User.hasMany(Product);
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
// DELETE, UPDATE 모두 CASCADE가 기본값
// 각 모델에 대한 관계 메서드 생성됨!
User.hasOne(Cart);
Cart.belongsTo(User);

// Cart와 Product의 id의 조합을 저장하는 중계 테이블 생성
// 중계테이블인 CartItem은 따로 모델 정의를 했으므로 해당 모델에서 정의한 열도 추가됌
// string이 아닌 모델을 넣음으로써 커스텀한 중계 테이블 생성 가능
// 이들이 연결되는 경우에만 작동
Cart.belongsToMany(Product, { through: CartItem }); // 한 장바구니가 여러 제품 담을 수 있음
Product.belongsToMany(Cart, { through: CartItem }); // 한 제품이 여러 장바구니에 속할 수 있음

User.hasMany(Order);
Order.belongsTo(User);
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

sequelize
  // .sync({ force: true })
  .sync()
  .then(async () => {
    const [user] = await User.findOrCreate({
      where: { name: 'Max', email: 'abc123@test.com' },
    });

    const cart = await user.getCart();
    if (!cart) {
      await user.createCart();
    }

    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
