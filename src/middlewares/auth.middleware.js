const jwt = require('jsonwebtoken');
const config = require('../config/database');

/**
 * Middleware factory to verify JWT token and authenticate user
 */
function createAuthMiddleware(options = {}) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.'
        });
      }

      const token = authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format.'
        });
      }

      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
      
      // Check admin role if required
      if (options.requireAdmin && (!req.user || req.user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired.'
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token.'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Authentication failed.',
        error: error.message
      });
    }
  };
}

// Export middleware instances
exports.authenticate = createAuthMiddleware();
exports.authMiddleware = createAuthMiddleware();
exports.isAdmin = createAuthMiddleware({ requireAdmin: true });
