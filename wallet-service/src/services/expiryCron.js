const cron = require('node-cron');
const walletService = require('./walletService');
const config = require('../config');

// Default: run every day at 02:00 AM
const CRON_EXPRESSION = config.expiryCron;

class ExpiryCronService {
  isRunning = false;

  start() {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    const job = cron.schedule(CRON_EXPRESSION, async () => {
      if (this.isRunning) return;
      this.isRunning = true;
      try {
        const result = await walletService.expireRewards();
        console.log(`[ExpiryCron] Expired ${result.expiredCount} reward(s) at ${new Date().toISOString()}`);
      } catch (error) {
        console.error('[ExpiryCron] Error running expiry:', error.message);
      } finally {
        this.isRunning = false;
      }
    });
    job.start();
    console.log(`Expiry cron job scheduled (${CRON_EXPRESSION})`);
    return job;
  }
}

module.exports = new ExpiryCronService();