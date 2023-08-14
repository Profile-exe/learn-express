const jwt = require('jsonwebtoken');

require('dotenv').config();

/**
 * @description 인증 토큰을 검증하는 미들웨어
 * 토큰이 없어도 에러를 발생시키지 않고, req.isAuth를 false로 설정
 * 토큰이 있으면 req.isAuth를 true로 설정하고, req.userId에 사용자 ID를 설정
 * 요청 지속 여부를 resolver에서 확인하고 결정
 */

module.exports = (req, res, next) => {
  const authHeader = req.headers?.authorization;

  if (!authHeader) {
    req.isAuth = false;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken) {
      req.isAuth = false;
      return next();
    }

    req.userId = decodedToken.userId;
    req.isAuth = true;
    next();
  } catch (err) {
    req.isAuth = false;
    return next();
  }
};
