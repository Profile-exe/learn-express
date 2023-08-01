const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },

  postCart: async (req, res, next) => {
    const prodId = req.body.productId;
    try {
      const product = await Product.findById(prodId);

      await req.user.addToCart(product);

      res.redirect('/cart');
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },

  postCartDeleteProduct: async (req, res, next) => {
    const prodId = req.body.productId;
    try {
      await req.user.removeFromCart(prodId);

      res.redirect('/cart');
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
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
      const error = new Error(err);
      console.log('postOrder error', err);
      error.httpStatusCode = 500;
      return next(error);
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },

  getCheckout: (req, res, next) => {
    res.render('shop/checkout', {
      pageTitle: 'Checkout',
      path: '/shop/checkout',
    });
  },

  getInvoice: async (req, res, next) => {
    const orderId = req.params.orderId;
    const invoiceName = `invoice-${orderId}.pdf`;
    const invoicePath = path.join('data', 'invoices', invoiceName);

    try {
      const order = await Order.findById(orderId);

      if (!order) return next(new Error('No order found.'));

      if (order.user._id.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=${invoiceName}`,
      });

      const pdfDoc = new PDFDocument();

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true,
      });
      pdfDoc.text('-----------------------');

      let totalPrice = 0;
      for (const prod of Array.from(order.items)) {
        totalPrice += prod.quantity * prod.productId.price;
        pdfDoc
          .fontSize(14)
          .text(
            `${prod.productId.title} - ${prod.quantity} x $${prod.productId.price}`
          );
      }

      pdfDoc.text('-----------------------');
      pdfDoc.text(`Total Price: $${totalPrice}`);

      pdfDoc.end();
    } catch (err) {
      const error = new Error(err);
      console.error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },
};
