module.exports = {
  // Test database configuration
  MONGODB_URI: 'mongodb://localhost:27017/tech-ecommerce-test',
  
  // JWT secret for testing
  JWT_SECRET: 'test-jwt-secret-key-for-testing-purposes-only',
  
  // Test user credentials
  testUser: {
    email: 'testuser@example.com',
    password: 'TestPassword123!',
    role: 'customer'
  },
  
  testAdmin: {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    role: 'admin'
  },
  
  // Sample product data
  sampleProduct: {
    name: 'Test Laptop Pro',
    description: 'High-performance laptop for professionals',
    price: 1299.99,
    category: 'laptops',
    stock: 50,
    brand: 'TechBrand',
    images: ['https://example.com/image1.jpg'],
    specifications: {
      ram: '16GB',
      storage: '512GB SSD',
      processor: 'Intel i7'
    }
  },
  
  sampleProductUpdate: {
    name: 'Updated Laptop Pro',
    price: 1199.99,
    stock: 45
  }
};
