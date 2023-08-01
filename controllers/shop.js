const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const { Product } = require('../models/product');
const { Order } = require('../models/order');

const ITEMS_PER_PAGE = 2;

module.exports = {
  getIndex: async (req, res, next) => {
    const page = +req.query.page || 1; // +를 붙이면 숫자로 변환됨
    try {
      const numProducts = await Product.find().countDocuments();

      const products = await Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);

      const pagenationObj = {
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < numProducts,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(numProducts / ITEMS_PER_PAGE),
      };

      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        ...pagenationObj,
      });
    } catch (err) {
      const error = new Error(err);
      console.log('getIndex error', err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },

  getProducts: async (req, res, next) => {
    const page = +req.query.page || 1; // +를 붙이면 숫자로 변환됨
    try {
      const numProducts = await Product.find().countDocuments();

      const products = await Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);

      const pagenationObj = {
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < numProducts,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(numProducts / ITEMS_PER_PAGE),
      };

      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        ...pagenationObj,
      });
    } catch (err) {
      const error = new Error(err);
      console.log('getProducts error', err);
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
      console.log('getCart error', err);
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
      console.log('postCart error', err);
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
      console.log('postCartDeleteProduct error', err);
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
      console.log('getOrders error', err);
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
      console.log('getInvoice error', err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },
};
