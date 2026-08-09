const walletService = require('../services/walletService');
const {
  useRewardSchema,
  historyQuerySchema,
} = require('../validators/walletValidator');

class CustomerController {
  // GET /api/customer/wallet - balance for the authenticated customer
  async getWallet(req, res, next) {
    try {
      const balance = await walletService.getBalance(req.customerId);
      res.status(200).json({
        status: 'success',
        data: balance,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/customer/history - reward history for the authenticated customer
  async getHistory(req, res, next) {
    try {
      const { error, value } = historyQuerySchema.validate({
        ...req.query,
        userId: req.customerId,
      });
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message,
        });
      }

      const result = await walletService.getHistory(req.customerId, value);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/customer/use - use points/tokens for the authenticated customer
  async useReward(req, res, next) {
    try {
      const { error, value } = useRewardSchema.validate({
        ...req.body,
        userId: req.customerId,
      });
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
}

module.exports = new CustomerController();
