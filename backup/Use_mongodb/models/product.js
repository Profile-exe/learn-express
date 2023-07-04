const { ObjectId } = require('mongodb');
const { getDb } = require('../util/database');

class Product {
  constructor(title, price, description, imageUrl, userId, id) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this.userId = userId;
    this._id = id ? new ObjectId(id) : null;
  }

  async save() {
    try {
      const db = getDb();
      let result;

      if (this._id) {
        // 이미 존재하는 제품이라면 update
        result = await db
          .collection('products')
          .updateOne({ _id: this._id }, { $set: this });
      } else {
        // 아니라면 새로 생성
        result = await db.collection('products').insertOne(this);
      }

      console.log(result);
    } catch (err) {
      console.log(err);
    }
  }

  static async fetchAll() {
    try {
      const db = getDb();
      const products = await db.collection('products').find().toArray();
      return products;
    } catch (err) {
      console.log(err);
    }
  }

  static async findById(prodId) {
    try {
      const db = getDb();
      const product = await db
        .collection('products')
        .findOne({ _id: new ObjectId(prodId) });
      return product;
    } catch (err) {
      console.log(err);
    }
  }

  static async deleteById(prodId) {
    try {
      const db = getDb();
      await db
        .collection('products')
        .deleteOne({ _id: new ObjectId(prodId) });
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = Product;
