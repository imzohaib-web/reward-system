const Joi = require('joi');

const itemSchema = Joi.object({
  productId: Joi.string().required(),
  productName: Joi.string().optional(),
  quantity: Joi.number().integer().min(1).optional(),
  price: Joi.number().min(0).optional(),
});

const orderSchema = Joi.object({
  orderId: Joi.string().required().messages({
    'string.empty': 'Order ID is required',
    'any.required': 'Order ID is required',
  }),
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required',
  }),
  status: Joi.string()
    .valid('PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED')
    .required()
    .messages({
      'any.only': 'Invalid order status',
      'any.required': 'Order status is required',
    }),
  items: Joi.array().items(itemSchema).optional(),
  referralCode: Joi.string().optional(),
  referrerUserId: Joi.string().optional(),
  source: Joi.string().valid('FOOD_APP', 'SUPERMALL_APP').optional(),
});

const referralSchema = Joi.object({
  referrerUserId: Joi.string().required().messages({
    'string.empty': 'Referrer User ID is required',
    'any.required': 'Referrer User ID is required',
  }),
  referredUserId: Joi.string().required().messages({
    'string.empty': 'Referred User ID is required',
    'any.required': 'Referred User ID is required',
  }),
  referralCode: Joi.string().required().messages({
    'string.empty': 'Referral code is required',
    'any.required': 'Referral code is required',
  }),
});

const updateRuleSchema = Joi.object({
  ruleKey: Joi.string().required().messages({
    'string.empty': 'Rule key is required',
    'any.required': 'Rule key is required',
  }),
  value: Joi.number().min(0).optional(),
  expiryDays: Joi.number().integer().min(1).optional(),
  status: Joi.string().valid('Active', 'Inactive').optional(),
  condition: Joi.object().optional(),
  description: Joi.string().optional(),
  ruleName: Joi.string().optional(),
  rewardType: Joi.string().valid('Points', 'Free Delivery Token').optional(),
});

const cancelOrderSchema = Joi.object({
  orderId: Joi.string().required().messages({
    'string.empty': 'Order ID is required',
    'any.required': 'Order ID is required',
  }),
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required',
  }),
  reason: Joi.string().optional(),
});

module.exports = {
  orderSchema,
  referralSchema,
  updateRuleSchema,
  cancelOrderSchema,
};