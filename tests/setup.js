/**
 * Setup file for Jest tests
 * Configures test environment before each test suite
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/tech-ecommerce-test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';

// Mock console methods to reduce noise in test output (optional)
// Uncomment if you want to suppress console logs during tests
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };

// Global timeout for async tests
jest.setTimeout(10000);

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Cleanup after all tests
afterAll(() => {
  jest.resetAllMocks();
});
