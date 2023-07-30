const { Product } = require('../models/product');
const { Order } = require('../models/order');

module.exports = {
  getIndex: async (req, res, next) => {
    try {
      const products = await Product.find();

      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
      });
    } catch (err) {
      console.log(err);
    }
  },

  getProducts: async (req, res, next) => {
    try {
      const products = await Product.find();

      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
      });
    } catch (err) {
      console.log(err);
    }
  },

  getProduct: async (req, res, next) => {
    const prodId = req.params.productId;
    try {
      const product = await Product.findById(prodId);

      res.render('shop/product-detail', {
        product,
        pageTitle: product.title,
        path: '/products',
      });
    } catch {
      (err) => console.log(err);
    }
  },

  getCart: async (req, res, next) => {
    try {
      const carts = await req.user.getCart();

      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        prods: carts,
      });
    } catch (err) {
      console.log(err);
    }
  },

  postCart: async (req, res, next) => {
    const prodId = req.body.productId;
    try {
      const product = await Product.findById(prodId);

      await req.user.addToCart(product);

      res.redirect('/cart');
    } catch (err) {
      console.log(err);
    }
  },

  postCartDeleteProduct: async (req, res, next) => {
    const prodId = req.body.productId;
    try {
      await req.user.removeFromCart(prodId);

      res.redirect('/cart');
    } catch (err) {
      console.log(err);
    }
  },

  postOrder: async (req, res, next) => {
    try {
      const cart = await req.user.getCart();

      const order = new Order({
        items: cart,
        user: req.user,
      });

      await order.save();

      await req.user.clearCart();

      res.redirect('/orders');
    } catch (err) {
      console.log(err);
    }
  },

  getOrders: async (req, res, next) => {
    try {
      const orders = await Order.find({
        'user._id': req.user._id,
      });

      res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders',
        orders,
      });
    } catch (err) {
      console.log(err);
    }
  },

  getCheckout: (req, res, next) => {
    res.render('shop/checkout', {
      pageTitle: 'Checkout',
      path: '/shop/checkout',
    });
  },
};
