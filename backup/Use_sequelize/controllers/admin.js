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
    const { title, price, imageUrl, description } = req.body;
    req.user
      .createProduct({
        title,
        price,
        imageUrl,
        description,
      })
      .then((result) => {
        // console.log(result);
        console.log('Created Product');
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
    req.user // user는 has"Many" 이므로 getProduct"s"를 가짐
      .getProducts({ where: { id: prodId } }) // Product.findByPk(prodId)
      .then(([product]) => {
        // 배열 구조분해할당: 첫번째 요소만 얻기
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
    // 해당 사용자에게 이 제품이 있다고 간주하므로
    // Product에서 findByPk로 탐색해도 괜찮은듯 깔끔함
    Product.findByPk(productId)
      .then((product) => {
        product.set({ title, imageUrl, description, price });
        return product.save();
      })
      .then((updatedProduct) => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products'); // 갱신 후 리다이렉트
      }) // 오류가 발생한 경우도 리다이렉트 페이지 만들어두기
      .catch((err) => console.log(err));
  },

  postDeleteProduct: (req, res, next) => {
    const prodId = req.body.productId;
    // Product.destroy({ where: { id: prodId } }).then().catch();
    // 사용자가 **소유한** 제품 중 해당 prodId를 가진 제품만 지워야하는데
    // 이렇게 두어도 괜찮을듯 Edit 및 Delete는 Admin에서만 하기 때문
    // 그리고 Admin getProduct(바로 아래 미들웨어)는
    // req.user.getProducts()로 해당 유저가 소유한 제품만 표시하기 때문
    Product.findByPk(prodId)
      .then((product) => {
        return product.destroy();
      })
      .then(() => {
        console.log('DESTROYED PRODUCT!');
        res.redirect('/admin/products');
      })
      .catch((err) => console.log(err));
  },

  getProducts: (req, res, next) => {
    // 해당 사용자가 가진 제품만 가져오므로
    // Edit 및 Delete 시 prodId를 이용한 탐색을 해도 됌
    // 따라서 post Edit/Delete Product 미들웨어는
    // Product.findByPk()를 사용해 구현하는게 깔끔함
    req.user
      .getProducts()
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
