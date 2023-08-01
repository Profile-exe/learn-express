const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');

const validators = {
  productTitle: body('title')
    .trim()
    .isString()
    .notEmpty()
    .withMessage('Title is required.')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters long.'),

  productPrice: body('price')
    .trim()
    .notEmpty()
    .withMessage('Price is required.')
    .isFloat()
    .withMessage('Price must be a number.'),

  productDescription: body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required.')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long.'),
};

const router = express.Router();

router.get('/products', adminController.getProducts);

router
  .route('/add-product')
  .get(adminController.getAddProduct)
  .post(
    [
      validators.productTitle,
      validators.productPrice,
      validators.productDescription,
    ],
    adminController.postAddProduct
  );

router.get('/edit-product/:productId', adminController.getEditProduct);

router.post(
  '/edit-product',
  [
    validators.productTitle,
    validators.productPrice,
    validators.productDescription,
  ],
  adminController.postEditProduct
);

router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;
