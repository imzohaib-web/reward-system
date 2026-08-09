const config = require('../config');

// Requires a valid API Secret Key (service-to-service communication)
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['api-key'];

  if (!apiKey) {
    return res.status(401).json({
      status: 'fail',
      message: 'API key is missing',
    });
  }

  if (apiKey !== config.apiSecretKey) {
    return res.status(403).json({
      status: 'fail',
      message: 'Invalid API key',
    });
  }

  req.authType = 'api-key';
  next();
};

module.exports = apiKeyAuth;
