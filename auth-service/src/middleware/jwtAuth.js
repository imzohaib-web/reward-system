const jwt = require('jsonwebtoken');
const config = require('../config');
const Customer = require('../models/Customer');

// Requires a valid customer JWT (customer portal access)
const jwtAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers['x-auth-token'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'fail',
      message: 'No token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const customer = await Customer.findById(decoded.id);
    if (!customer) {
      return res.status(401).json({
        status: 'fail',
        message: 'User no longer exists',
      });
    }
    if (!customer.isActive) {
      return res.status(403).json({
        status: 'fail',
        message: 'Account is disabled',
      });
    }
    req.customer = customer;
    req.authType = 'jwt';
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid or expired token',
    });
  }
};

module.exports = jwtAuth;
