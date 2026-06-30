const jwt = require('jsonwebtoken');
const config = require('./test.config');

/**
 * Generate a valid JWT token for testing
 * @param {Object} payload - User data to include in token
 * @returns {String} JWT token
 */
exports.generateToken = (payload) => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '1h' });
};

/**
 * Create authentication headers for requests
 * @param {Object} user - User data
 * @returns {Object} Headers object with Authorization
 */
exports.createAuthHeaders = (user) => {
  const token = this.generateToken({
    id: user.id || 'test-user-id',
    email: user.email,
    role: user.role
  });
  
  return {
    Authorization: `Bearer ${token}`
  };
};

/**
 * Create admin authentication headers
 * @returns {Object} Headers object with admin Authorization
 */
exports.createAdminAuthHeaders = () => {
  return this.createAuthHeaders({
    id: 'admin-user-id',
    email: config.testAdmin.email,
    role: 'admin'
  });
};

/**
 * Create regular user authentication headers
 * @returns {Object} Headers object with user Authorization
 */
exports.createUserAuthHeaders = () => {
  return this.createAuthHeaders({
    id: 'test-user-id',
    email: config.testUser.email,
    role: 'customer'
  });
};

/**
 * Create expired token for testing
 * @returns {String} Expired JWT token
 */
exports.generateExpiredToken = () => {
  return jwt.sign(
    { id: 'test-user-id', email: config.testUser.email, role: 'customer' },
    config.JWT_SECRET,
    { expiresIn: '-1h' }
  );
};

/**
 * Create invalid token for testing
 * @returns {String} Invalid JWT token
 */
exports.generateInvalidToken = () => {
  return 'invalid.token.here';
};

/**
 * Sample product data factory
 * @param {Object} overrides - Properties to override default values
 * @returns {Object} Product data
 */
exports.createProductData = (overrides = {}) => {
  return {
    ...config.sampleProduct,
    ...overrides
  };
};

/**
 * Sample user data factory
 * @param {Object} overrides - Properties to override default values
 * @returns {Object} User data
 */
exports.createUserData = (overrides = {}) => {
  return {
    email: `user${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User',
    role: 'customer',
    ...overrides
  };
};
