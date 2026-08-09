const jwt = require('jsonwebtoken');
const config = require('../config');

// Requires a valid customer JWT (signed by the Auth Service)
// The customer's userId is taken from the token, never from the request body.
const customerAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers['x-auth-token'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'fail',
      message: 'No token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.customerJwt.secret);
    if (!decoded.id || decoded.role !== 'CUSTOMER') {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid customer token',
      });
    }
    req.customerId = String(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid or expired token',
    });
  }
};

module.exports = customerAuth;
