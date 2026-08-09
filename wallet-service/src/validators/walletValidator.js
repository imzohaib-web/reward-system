const Joi = require('joi');

const addRewardSchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required',
  }),
  rewardType: Joi.string().valid('Points', 'Free Delivery Token').required().messages({
    'any.only': 'Reward type must be either Points or Free Delivery Token',
    'any.required': 'Reward type is required',
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be a positive number',
    'any.required': 'Amount is required',
  }),
  referenceId: Joi.string().required().messages({
    'string.empty': 'Reference ID is required',
    'any.required': 'Reference ID is required',
  }),
  referenceType: Joi.string().valid('ORDER', 'REFERRAL', 'PRODUCT_REWARD', 'ORDER_MILESTONE', 'MANUAL').required().messages({
    'any.only': 'Invalid reference type',
    'any.required': 'Reference type is required',
  }),
  description: Joi.string().optional(),
  expiryDays: Joi.number().integer().min(1).optional(),
  metadata: Joi.object().optional(),
});

const useRewardSchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required',
  }),
  rewardType: Joi.string().valid('Points', 'Free Delivery Token').required().messages({
    'any.only': 'Reward type must be either Points or Free Delivery Token',
    'any.required': 'Reward type is required',
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be a positive number',
    'any.required': 'Amount is required',
  }),
  referenceId: Joi.string().required().messages({
    'string.empty': 'Reference ID is required',
    'any.required': 'Reference ID is required',
  }),
  referenceType: Joi.string().valid('ORDER', 'MANUAL').required().messages({
    'any.only': 'Invalid reference type',
    'any.required': 'Reference type is required',
  }),
  description: Joi.string().optional(),
});

const removeRewardSchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required',
  }),
  rewardType: Joi.string().valid('Points', 'Free Delivery Token').required().messages({
    'any.only': 'Reward type must be either Points or Free Delivery Token',
    'any.required': 'Reward type is required',
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be a positive number',
    'any.required': 'Amount is required',
  }),
  referenceId: Joi.string().required().messages({
    'string.empty': 'Reference ID is required',
    'any.required': 'Reference ID is required',
  }),
  referenceType: Joi.string().valid('REVERSAL', 'MANUAL').required().messages({
    'any.only': 'Invalid reference type',
    'any.required': 'Reference type is required',
  }),
  description: Joi.string().optional(),
});

const historyQuerySchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required',
  }),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('Earned', 'Used', 'Expired', 'Reversed').optional(),
  rewardType: Joi.string().valid('Points', 'Free Delivery Token').optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
});

const balanceQuerySchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required',
  }),
});

module.exports = {
  addRewardSchema,
  useRewardSchema,
  removeRewardSchema,
  historyQuerySchema,
  balanceQuerySchema,
};