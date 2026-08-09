const rewardService = require('../services/rewardService');
const { orderSchema, referralSchema, updateRuleSchema, cancelOrderSchema } = require('../validators/rewardValidator');

class RewardController {
  async processOrder(req, res, next) {
    try {
      const { error, value } = orderSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message,
        });
      }

      const result = await rewardService.processOrder(value);

      res.status(200).json({
        status: 'success',
        message: 'Order processed for rewards',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const { error, value } = cancelOrderSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message,
        });
      }

      const result = await rewardService.cancelOrder(value);

      res.status(200).json({
        status: 'success',
        message: 'Order cancellation processed and rewards revoked',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async processReferral(req, res, next) {
    try {
      const { error, value } = referralSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message,
        });
      }

      const record = await rewardService.createReferralRecord(value);

      res.status(201).json({
        status: 'success',
        message: 'Referral record created',
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRules(req, res, next) {
    try {
      const rules = await rewardService.getRules();

      res.status(200).json({
        status: 'success',
        count: rules.length,
        data: rules,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRule(req, res, next) {
    try {
      const { error, value } = updateRuleSchema.validate({
        ...req.params,
        ...req.body,
      });
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message,
        });
      }

      const { ruleKey, ...updates } = value;
      const rule = await rewardService.updateRule(ruleKey, updates);

      res.status(200).json({
        status: 'success',
        message: 'Reward rule updated',
        data: rule,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RewardController();