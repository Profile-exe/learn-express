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
    // findAll({ where: { id: prodId }})로 구현 가능
    // 주의: findAll은 요소가 하나라도 배열로 주므로 첫번째 요소를 받아야함
    // 배열 구조분해할당을 이용해 첫번째 요소만 받기 ex) ([product]) => {...}
    // 구조분해할당을 중첩하여 첫 요소(배열)의 첫 요소를 받는것도 가능 [[product]]
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
      const products = await cart.getProducts();

      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        prods: products,
      });
    } catch (err) {
      console.log(err);
    }
  },

  postCart: async (req, res, next) => {
    const prodId = req.body.productId;
    try {
      const cart = await req.user.getCart();

      const products = await cart.getProducts({ where: { id: prodId } });
      const product = products.length > 0 ? products[0] : null;

      const oldQuantity = product ? product.cartItem.quantity : 0;
      const newQuantity = oldQuantity + 1;

      const updatedProduct = product ?? (await Product.findByPk(prodId));
      await cart.addProduct(updatedProduct, {
        through: { quantity: newQuantity },
      });

      res.redirect('/cart');
    } catch (err) {
      console.log(err);
    }
  },

  postCartDeleteProduct: async (req, res, next) => {
    const prodId = req.body.productId;
    try {
      const cart = await req.user.getCart();

      const products = await cart.getProducts({ where: { id: prodId } });
      const targetProduct = products[0] ?? null;

      if (targetProduct) {
        await targetProduct.cartItem.destroy();
      }

      res.redirect('/cart');
    } catch (err) {
      console.log(err);
    }
  },

  postOrder: async (req, res, next) => {
    try {
      const cart = await req.user.getCart();
      const products = await cart.getProducts();

      const order = await req.user.createOrder();
      await order.addProducts(
        products.map((product) => {
          // addProducts는 orderItem의 테이블에 생성되는 것이니 quantity를 추가해줌
          // through 옵션으로 quantity를 넘겨줘야하는데, 각 product마다 cart에 넣은 quantity가 다름
          // 따라서 map 함수를 통해 각각의 quantity를 불러와서 orderItem.quantity를 넣어준 것
          // 이러면 through 옵션을 넣지 않아도 주어진 제품들(배열)만으로 sequelize가 알아서 orderItem에 row를 생성함
          product.orderItem = { quantity: product.cartItem.quantity };
          return product;
        })
      );

      await cart.setProducts(null); // 장바구니 비우기
      res.redirect('/orders');
    } catch (err) {
      console.log(err);
    }
  },

  getOrders: async (req, res, next) => {
    try {
      const orders = await req.user.getOrders({ include: ['products'] });
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
