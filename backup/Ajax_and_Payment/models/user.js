const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: { type: String, require: true },
  resetToken: { type: String },
  resetTokenExpiration: { type: Date },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = async function (product) {
  const existingCartItem = this.cart.items.find(
    (cp) => cp.productId.toString() === product._id.toString()
  );

  if (existingCartItem) {
    existingCartItem.quantity += 1;
  } else {
    this.cart.items.push({
      productId: product._id,
      quantity: 1,
    });
  }

  await this.save();
};

userSchema.methods.getCart = async function () {
  const userWithProducts = await this.populate('cart.items.productId');

  return userWithProducts.cart.items;
};

userSchema.methods.removeFromCart = async function (prodId) {
  this.cart.items = this.cart.items.filter(
    (item) => item.productId.toString() !== prodId.toString()
  );

  await this.save();
};

userSchema.methods.clearCart = async function () {
  this.cart = { items: [] };

  await this.save();
};

module.exports = {
  User: mongoose.model('User', userSchema),
  userSchema,
};

/* const { ObjectId } = require('mongodb');
const { getDb } = require('../util/database');

class User {
  constructor(name, email, cart, id) {
    this.name = name;
    this.email = email;
    this.cart = cart; // {items: []}
    this._id = id ? new ObjectId(id) : null;
  }

  async save() {
    try {
      const db = getDb();
      let result;

      if (this._id) {
        result = await db
          .collection('users')
          .updateOne({ _id: this._id }, { $set: this });
      } else {
        result = await db.collection('users').insertOne(this);
      }

      console.log(result);
    } catch (err) {
      console.log(err);
    }
  }

  async addToCart(product) {
    // Chat GPT로 리펙토링했음 기록 보고 변경 전이랑 비교하며 공부하기
    const db = getDb();

    const cartProductIndex = this.cart.items.findIndex(
      (cp) => cp.productId.toString() === product._id.toString()
    );
    const updatedCartItems = [...this.cart.items];
    const existingCartItem = updatedCartItems[cartProductIndex];

    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: 1,
      });
    }

    await db
      .collection('users')
      .updateOne(
        { _id: this._id },
        { $set: { 'cart.items': updatedCartItems } }
      );
  }

  findCartItemById(prodId) {
    return this.cart.items.find(
      (item) => item.productId.toString() === prodId.toString()
    );
  }

  async getCart() {
    // 일반 Cart가 아닌 제품 전체 정보를 포함한 Cart를 불러오기 위한 코드
    // 일반 Cart는 productId와 quantity만 저장
    // 새로운 Cart는 product 전체 정보와 quantity를 지님
    // 참조가 없는 두 컬렉션 중 한쪽 데이터를 불러오는 방법
    try {
      const db = getDb();
      const productIdList = this.cart.items.map((item) => item.productId);

      const products = await db
        .collection('products')
        .find({ _id: { $in: productIdList } }) // $in : [...productIdList] 와 동일
        .toArray();

      const fullCart = products.map((product) => {
        const { quantity } = this.findCartItemById(product._id);
        return { ...product, quantity };
      });

      return fullCart;
    } catch (err) {
      console.log(err);
    }
  }

  async deleteItemFromCart(prodId) {
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.productId.toString() !== prodId.toString();
    });

    const db = getDb();
    await db
      .collection('users')
      .updateOne(
        { _id: this._id },
        { $set: { 'cart.items': updatedCartItems } }
      );
  }

  async addToOrder() {
    try {
      const db = getDb();
      const fullProds = await this.getCart();

      const order = {
        items: fullProds,
        user: {
          _id: this._id,
          name: this.name,
          email: this.email,
        },
      };

      // 장바구니를 비우기 전 먼저 주문에 추가하기!
      await db.collection('orders').insertOne(order);

      this.cart = { items: [] }; // cart 비우기

      await db // db에서도 cart 비우기
        .collection('users')
        .updateOne({ _id: this._id }, { $set: { 'cart.items': [] } });
    } catch (err) {
      console.log(err);
    }
  }

  async getOrders() {
    try {
      const db = getDb();
      const orders = await db
        .collection('orders')
        .find({ 'user._id': this._id })
        .toArray();

      return orders;
    } catch (err) {
      console.log(err);
    }
  }

  static async findById(userId) {
    try {
      const db = getDb();
      const user = await db
        .collection('users')
        .findOne({ _id: new ObjectId(userId) });

      // 데이터베이스나 파일에서 불러온 객체는 단순히 데이터의 상태만을 가지고 있음
      // 따라서 User의 메서드를 사용할 수 있도록
      // 객체 생성에 필요한 속성들을 가져온 후 new User로 인스턴스 반환
      const { name, email, cart, _id } = user;
      return new User(name, email, cart, _id);
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = User;
 */
