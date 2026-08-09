const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const config = require('../config');
const AppError = require('../utils/AppError');
const { registerSchema, loginSchema } = require('../validators/authValidator');

class AuthController {
  async register(req, res, next) {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message,
        });
      }

      const existing = await Customer.findOne({ email: value.email.toLowerCase() });
      if (existing) {
        throw new AppError('An account with this email already exists', 409);
      }

      const customer = await Customer.create(value);
      const token = jwt.sign(
        { id: customer._id, email: customer.email, role: 'CUSTOMER' },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.status(201).json({
        status: 'success',
        message: 'Account created successfully',
        data: {
          token,
          customer: {
            id: customer._id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

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

      const customer = await Customer.findOne({ email: email.toLowerCase() });
      if (!customer) {
        throw new AppError('Invalid email or password', 401);
      }

      if (!customer.isActive) {
        throw new AppError('Account is disabled', 403);
      }

      const isMatch = await customer.comparePassword(password);
      if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
      }

      const token = jwt.sign(
        { id: customer._id, email: customer.email, role: 'CUSTOMER' },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          token,
          customer: {
            id: customer._id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
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
        id: req.customer._id,
        name: req.customer.name,
        email: req.customer.email,
        phone: req.customer.phone,
        createdAt: req.customer.createdAt,
      },
    });
  }
}

module.exports = new AuthController();
