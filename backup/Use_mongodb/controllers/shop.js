const { ObjectId } = require('mongodb');
const { getDb } = require('../util/database');
const Product = require('../models/product');

module.exports = {
  getIndex: (req, res, next) => {
    Product.fetchAll()
      .then((products) => {
        res.render('shop/index', {
          prods: products,
          pageTitle: 'Shop',
          path: '/',
        });
      })
      .catch((err) => console.log(err));
  },

  getProducts: (req, res, next) => {
    Product.fetchAll()
      .then((products) => {
        res.render('shop/product-list', {
          prods: products,
          pageTitle: 'All Products',
          path: '/products',
        });
      })
      .catch((err) => console.log(err));
  },

  getProduct: (req, res, next) => {
    const prodId = req.params.productId;

    Product.findById(prodId)
      .then((product) => {
        res.render('shop/product-detail', {
          product,
          pageTitle: product.title,
          path: '/products',
        });
      })
      .catch((err) => console.log(err));
  },

  getCart: async (req, res, next) => {
    try {
      const cart = await req.user.getCart();

      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        prods: cart,
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
      await req.user.deleteItemFromCart(prodId);

      res.redirect('/cart');
    } catch (err) {
      console.log(err);
    }
  },

  postOrder: async (req, res, next) => {
    try {
      await req.user.addToOrder();

      res.redirect('/orders');
    } catch (err) {
      console.log(err);
    }
  },

  getOrders: async (req, res, next) => {
    try {
      const orders = await req.user.getOrders();

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
