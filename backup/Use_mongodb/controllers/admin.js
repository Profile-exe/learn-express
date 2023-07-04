const Product = require('../models/product');

module.exports = {
  getAddProduct: (req, res, next) => {
    res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
    });
  },

  postAddProduct: (req, res, next) => {
    const { title, price, description, imageUrl } = req.body;
    const product = new Product(
      title,
      price,
      description,
      imageUrl,
      req.user._id
    );
    product
      .save()
      .then(() => {
        console.log('Created Product: ', product);
        return res.redirect('/admin/products');
      })
      .catch((err) => {
        console.log(err);
      });
  },

  getEditProduct: (req, res, next) => {
    const editMode = req.query.edit; // 추출되는 값은 항상 string!
    if (editMode !== 'true') {
      // 부가적인 코드 -> 이미 EditProduct 컨트롤러는 editMode가 true
      return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
      .then((product) => {
        if (!product) {
          // 원래는 오류가 나도록 해야함. 이상적인 UX가 아님
          return res.render('/');
        }
        res.render('admin/edit-product', {
          product,
          pageTitle: 'Edit Product',
          path: '/admin/edit-product',
          editing: editMode,
        });
      })
      .catch((err) => console.log(err));
  },

  postEditProduct: (req, res, next) => {
    const { title, imageUrl, description, price, productId } = req.body;
    const product = new Product(
      title,
      price,
      description,
      imageUrl,
      productId // 생성자에서 내부적으로 ObejctId로 변환
    );

    product
      .save()
      .then(() => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products'); // 갱신 후 리다이렉트
      }) // 오류가 발생한 경우도 리다이렉트 페이지 만들어두기
      .catch((err) => console.log(err));
  },

  postDeleteProduct: async (req, res, next) => {
    try {
      const prodId = req.body.productId;

      await Product.deleteById(prodId);

      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    } catch (err) {
      console.log(err);
    }
  },

  getProducts: (req, res, next) => {
    // 해당 사용자가 가진 제품만 가져오므로
    // Edit 및 Delete 시 prodId를 이용한 탐색을 해도 됌
    // 따라서 post Edit/Delete Product 미들웨어는
    // Product.findByPk()를 사용해 구현하는게 깔끔함
    Product.fetchAll()
      .then((products) => {
        res.render('admin/products', {
          prods: products,
          pageTitle: 'Admin Products',
          path: '/admin/products',
        });
      })
      .catch((err) => console.log(err));
  },
};
