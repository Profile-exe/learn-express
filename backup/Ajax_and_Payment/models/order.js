const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const { productSchema } = require('./product');
const { userSchema } = require('./user');

const orderSchema = new Schema({
  items: [
    {
      // cart에서 productId로 populate 시 productId 안에 Product 내용 저장
      productId: productSchema,
      quantity: { type: Number, required: true },
    },
  ],
  user: userSchema,
});

module.exports = {
  Order: mongoose.model('Order', orderSchema),
  orderSchema,
};
