const mongoose = require('mongoose');

const { validationResult } = require('express-validator');

const { Product } = require('../models/product');

module.exports = {
  getAddProduct: (req, res, next) => {
    if (!req.session.isLoggedIn) {
      return res.redirect('/login');
    }

    res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      oldInput: { title: '', price: '', description: '', imageUrl: '' },
    });
  },

  postAddProduct: async (req, res, next) => {
    const { title, price, description, imageUrl } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render('admin/edit-product', {
        path: '/admin/add-product',
        pageTitle: 'Add Product',
        editing: false,
        oldInput: { title, price, description, imageUrl },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }

    try {
      const product = new Product({
        title,
        price,
        description,
        imageUrl,
        userId: req.user._id, // req.user를 저장해도 ObjectId인 user._id만 저장됨
      });
      const prodData = await product.save();

      console.log('Created Product: ', prodData);
      res.redirect('/admin/products');
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },

  getEditProduct: async (req, res, next) => {
    const editMode = req.query.edit; // 추출되는 값은 항상 string!
    if (editMode !== 'true') {
      // 부가적인 코드 -> 이미 EditProduct 컨트롤러는 editMode가 true
      return res.redirect('/');
    }
    const prodId = req.params.productId;

    try {
      const product = await Product.findById(prodId);

      if (!product) {
        // 원래는 오류가 나도록 해야함. 이상적인 UX가 아님
        return res.render('/');
      }

      res.render('admin/edit-product', {
        product,
        path: '/admin/edit-product',
        pageTitle: 'Edit Product',
        editing: editMode,
      });
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },

  postEditProduct: async (req, res, next) => {
    const { title, price, description, imageUrl, productId } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render('admin/edit-product', {
        product: {
          title,
          price,
          description,
          imageUrl,
          _id: productId,
        },
        path: '/admin/edit-product',
        pageTitle: 'Edit Product',
        editing: true,
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }

    try {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, userId: req.user._id },
        { title, price, description, imageUrl },
        { new: true }
      );

      if (!updatedProduct) {
        req.flash('error', 'Product not found or not matched user!');
        return res.redirect('/admin/products');
      }
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
    console.log('UPDATED PRODUCT!');
    res.redirect('/admin/products'); // 갱신 후 리다이렉트
  },

  postDeleteProduct: async (req, res, next) => {
    try {
      const prodId = req.body.productId;

      const deletedProduct = await Product.findOneAndDelete({
        _id: prodId,
        userId: req.user._id,
      });

      if (!deletedProduct) {
        req.flash('error', 'Product not found or not matched user!');
        return res.redirect('/admin/products');
      }

      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },

  getProducts: async (req, res, next) => {
    try {
      const products = await Product.find({ userId: req.user._id });

      res.render('admin/products', {
        prods: products,
        path: '/admin/products',
        pageTitle: 'Admin Products',
      });
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  },
};
