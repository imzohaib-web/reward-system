const walletService = require('../services/walletService');
const {
  addRewardSchema,
  useRewardSchema,
  removeRewardSchema,
  historyQuerySchema,
  balanceQuerySchema,
} = require('../validators/walletValidator');

class WalletController {
  async addReward(req, res, next) {
    try {
      const { error, value } = addRewardSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message,
        });
      }

      const result = await walletService.addReward(value);

      res.status(201).json({
        status: 'success',
        message: 'Reward added successfully',
        data: {
          wallet: result.wallet,
          transaction: result.transaction,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async useReward(req, res, next) {
    try {
      const { error, value } = useRewardSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message,
        });
      }

      const result = await walletService.useReward(value);

      res.status(200).json({
        status: 'success',
        message: 'Reward used successfully',
        data: {
          wallet: result.wallet,
          transaction: result.transaction,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async removeReward(req, res, next) {
    try {
      const { error, value } = removeRewardSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message,
        });
      }

      const result = await walletService.removeReward(value);

      res.status(200).json({
        status: 'success',
        message: 'Reward removed successfully',
        data: {
          wallet: result.wallet,
          transaction: result.transaction,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const { error, value } = historyQuerySchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message,
        });
      }

      const result = await walletService.getHistory(value.userId, value);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBalance(req, res, next) {
    try {
      const { error, value } = balanceQuerySchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message,
        });
      }

      const balance = await walletService.getBalance(value.userId);

      res.status(200).json({
        status: 'success',
        data: balance,
      });
    } catch (error) {
      next(error);
    }
  }
async expireRewards(req, res, next) {
    try {
      const result = await walletService.expireRewards();

      res.status(200).json({
        status: 'success',
        message: 'Expiry process completed',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WalletController();