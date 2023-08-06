const jwt = require('jsonwebtoken');

require('dotenv').config();

module.exports = (req, res, next) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken) {
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      return next(error);
    }

    req.userId = decodedToken.userId;
    next();
  } catch (err) {
    err.statusCode = 500;
    return next(err);
  }
};
