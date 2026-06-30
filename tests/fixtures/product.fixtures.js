/**
 * Mock data fixtures for testing
 */

const config = require('../helpers/test.config');

/**
 * Product fixtures - sample products for different test scenarios
 */
exports.products = {
  // Valid complete product
  validProduct: {
    name: 'MacBook Pro 16"',
    description: 'Powerful laptop for professionals with M2 chip',
    price: 2499.99,
    category: 'laptops',
    stock: 25,
    brand: 'Apple',
    images: [
      'https://example.com/macbook-front.jpg',
      'https://example.com/macbook-side.jpg'
    ],
    specifications: {
      processor: 'Apple M2 Pro',
      ram: '16GB',
      storage: '512GB SSD',
      display: '16-inch Liquid Retina XDR'
    }
  },

  // Minimal valid product
  minimalProduct: {
    name: 'Basic Mouse',
    description: 'Simple wireless mouse',
    price: 29.99,
    category: 'accessories',
    stock: 100
  },

  // Product for update tests
  updateProduct: {
    name: 'Updated MacBook Pro',
    description: 'Updated description with new features',
    price: 2299.99,
    stock: 20
  },

  // Invalid products for validation tests
  invalidMissingName: {
    description: 'Product without name',
    price: 99.99,
    category: 'laptops',
    stock: 10
  },

  invalidMissingPrice: {
    name: 'Product without price',
    description: 'This product has no price',
    category: 'laptops',
    stock: 10
  },

  invalidNegativePrice: {
    name: 'Product with negative price',
    description: 'This product has negative price',
    price: -100,
    category: 'laptops',
    stock: 10
  },

  invalidCategory: {
    name: 'Product with invalid category',
    description: 'This product has invalid category',
    price: 99.99,
    category: 'invalid-category',
    stock: 10
  },

  invalidNegativeStock: {
    name: 'Product with negative stock',
    description: 'This product has negative stock',
    price: 99.99,
    category: 'laptops',
    stock: -5
  },

  // Products for filtering tests
  laptopProduct: {
    name: 'Dell XPS 15',
    description: 'Premium Windows laptop',
    price: 1799.99,
    category: 'laptops',
    stock: 30,
    brand: 'Dell'
  },

  smartphoneProduct: {
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with A17 Pro chip',
    price: 999.99,
    category: 'smartphones',
    stock: 50,
    brand: 'Apple'
  },

  accessoryProduct: {
    name: 'AirPods Pro',
    description: 'Wireless earbuds with active noise cancellation',
    price: 249.99,
    category: 'accessories',
    stock: 75,
    brand: 'Apple'
  },

  cheapProduct: {
    name: 'USB-C Hub',
    description: 'Multi-port USB-C hub with HDMI',
    price: 49.99,
    category: 'accessories',
    stock: 200,
    brand: 'Anker'
  },

  expensiveProduct: {
    name: 'Gaming Monitor 4K',
    description: 'High-end 4K gaming monitor 144Hz',
    price: 899.99,
    category: 'accessories',
    stock: 15,
    brand: 'LG'
  },

  midRangeProduct: {
    name: 'Wireless Keyboard',
    description: 'Mechanical wireless keyboard',
    price: 129.99,
    category: 'accessories',
    stock: 50,
    brand: 'Logitech'
  }
};

/**
 * User fixtures
 */
exports.users = {
  // Admin user
  admin: {
    email: 'admin@techstore.com',
    password: 'Admin123!',
    name: 'Admin User',
    role: 'admin'
  },

  // Regular customer
  customer: {
    email: 'customer@example.com',
    password: 'Customer123!',
    name: 'John Doe',
    role: 'customer'
  },

  // Another customer for tests
  customer2: {
    email: 'jane@example.com',
    password: 'Jane123!',
    name: 'Jane Smith',
    role: 'customer'
  }
};

/**
 * Review fixtures
 */
exports.reviews = {
  validReview: {
    rating: 5,
    comment: 'Excellent product! Highly recommended.'
  },

  lowRatingReview: {
    rating: 2,
    comment: 'Not satisfied with the quality.'
  },

  invalidRating: {
    rating: 6,
    comment: 'Invalid rating above 5'
  },

  negativeRating: {
    rating: -1,
    comment: 'Invalid negative rating'
  },

  missingComment: {
    rating: 4
  }
};

/**
 * MongoDB ObjectId mock generator
 */
exports.generateMockId = () => {
  const chars = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * 16)];
  }
  return id;
};

/**
 * Invalid ObjectId format
 */
exports.invalidObjectId = 'invalid-id-format';

/**
 * Non-existent but valid format ObjectId
 */
exports.nonExistentId = '507f1f77bcf86cd799439011';
