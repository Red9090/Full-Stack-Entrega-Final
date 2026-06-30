/**
 * Database configuration
 */
module.exports = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tech-ecommerce',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production'
};
