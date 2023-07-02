const { ObjectId } = require('mongodb');
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
          .updateOne({ _id: this_id }, { $set: this });
      } else {
        result = await db.collection('users').insertOne(this);
      }

      console.log(result);
    } catch (err) {
      console.log(err);
    }
  }

  async addToCart(product) {
    // const cartProduct = this.cart.items.findIndex((cp) => {
    //   return cp._id === product._id;
    // });
    const updatedCart = { items: [{ ...product, quantity: 1 }] };
    const db = getDb();
    await db
      .collection('users')
      .updateOne({ _id: this_id }, { $set: { cart: updatedCart } });
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
