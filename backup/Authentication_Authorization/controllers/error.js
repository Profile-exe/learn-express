module.exports = {
  get404: (req, res, _next) => {
    res.status(404).render('404', {
      pageTitle: 'Page Not Found',
      path: '/404',
    });
  },
};