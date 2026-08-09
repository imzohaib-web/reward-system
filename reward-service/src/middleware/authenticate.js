const apiKeyAuth = require('./apiKeyAuth');
const jwtAuth = require('./jwtAuth');

// Accepts either a valid API key OR a valid JWT token
const authenticate = async (req, res, next) => {
  const hasApiKey = req.headers['x-api-key'] || req.headers['api-key'];
  const hasJwt = req.headers.authorization && req.headers.authorization.startsWith('Bearer ');

  if (!hasApiKey && !hasJwt) {
    return res.status(401).json({
      status: 'fail',
      message: 'Authentication required. Provide an API key or Bearer token.',
    });
  }

  if (hasApiKey) {
    return apiKeyAuth(req, res, next);
  }
  return jwtAuth(req, res, next);
};

module.exports = authenticate;