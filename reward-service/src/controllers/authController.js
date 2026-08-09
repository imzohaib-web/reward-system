const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config');
const AppError = require('../utils/AppError');
const { loginSchema } = require('../validators/authValidator');

class AuthController {
  async login(req, res, next) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message,
        });
      }

      const { email, password } = value;

      const admin = await Admin.findOne({ email });
      if (!admin) {
        throw new AppError('Invalid email or password', 401);
      }

      if (!admin.isActive) {
        throw new AppError('Account is disabled', 403);
      }

      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
      }

      const token = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          token,
          admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res) {
    res.status(200).json({
      status: 'success',
      data: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
      },
    });
  }
}

module.exports = new AuthController();