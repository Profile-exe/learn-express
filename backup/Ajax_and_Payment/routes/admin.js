const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

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

router.get('/products', isAuth, adminController.getProducts);

router
  .route('/add-product')
  .get(isAuth, adminController.getAddProduct)
  .post(
    isAuth,
    [
      validators.productTitle,
      validators.productPrice,
      validators.productDescription,
    ],
    adminController.postAddProduct
  );

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product',
  isAuth,
  [
    validators.productTitle,
    validators.productPrice,
    validators.productDescription,
  ],
  adminController.postEditProduct
);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
