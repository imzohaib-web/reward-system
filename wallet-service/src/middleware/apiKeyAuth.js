const config = require('../config');

// Applies a valid API key (x-API-key header) for service-to-service communication
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