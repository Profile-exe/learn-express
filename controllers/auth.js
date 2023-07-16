const { User } = require('../models/user');

module.exports = {
  getLogin: (req, res, next) => {
    console.log('isLoggedIn', req.session.isLoggedIn);

    res.render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      isAuthenticated: req.session.isLoggedIn,
    });
  },

  postLogin: async (req, res, next) => {
    const user = await User.findOne({ name: 'dding' });

    req.session.user = user;
    req.session.isLoggedIn = true;
    req.session.save((err) => {
      // 세션에 데이터가 저장되기 전에 리다이렉트가 발생할 수 있음
      // 따라서 명시적으로 save()를 호출하여 세션에 저장이 끝난 후 리다이렉트
      console.log('Session saved', err);
      res.redirect('/');
    });
  },

  postLogout: (req, res, next) => {
    // destroy()를 통해 세션을 지울 수 있지만 세션 쿠키는 남아있음
    // 이 쿠키에 대응하는 세션이 존재하지 않기 때문에 문제는 없음
    // 세션이 재생성시 세션 쿠키는 새로운 값으로 덮어씌워짐
    // 세션쿠키는 Expires, maxAge 등을 설정하지 않은 상태에선 브라우저를 닫아야 사라짐
    req.session.destroy((err) => {
      console.log('Session destroyed', err);
      res.redirect('/');
    });
  },
};
