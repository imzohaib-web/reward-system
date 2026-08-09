const jwt = require('jsonwebtoken');
const config = require('../config');
const Admin = require('../models/Admin');

// Requires a valid JWT (admin panel access)
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
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({
        status: 'fail',
        message: 'User no longer exists',
      });
    }
    req.admin = admin;
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