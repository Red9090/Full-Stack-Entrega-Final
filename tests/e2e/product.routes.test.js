/**
 * E2E (End-to-End) Tests for Product Routes
 * Tests the complete API endpoints using Supertest
 * These tests simulate real HTTP requests to the Express app
 */

const request = require('supertest');
const { generateToken } = require('../helpers/test.helpers');
const { products: productFixtures, reviews } = require('../fixtures/product.fixtures');
const { MockProductModel } = require('../helpers/mocks');

// Mock the Product model BEFORE importing app
jest.mock('../../src/models/Product', () => {
  const { MockProductModel } = require('../helpers/mocks');
  return MockProductModel;
});

// Mock database connection
jest.mock('../../src/config/db', () => jest.fn());

const app = require('../../src/server');

describe('Product Routes - E2E Tests', () => {
  let adminToken, userToken;

  beforeAll(() => {
    // Generate tokens for authenticated requests
    adminToken = generateToken({
      id: 'admin-123',
      email: 'admin@techstore.com',
      role: 'admin'
    });

    userToken = generateToken({
      id: 'user-456',
      email: 'customer@example.com',
      role: 'customer'
    });
  });

  beforeEach(() => {
    // Clear mock data before each test
    MockProductModel.clear();
  });

  describe('GET /api/products', () => {
    it('should return 200 and empty products list when no products exist', async () => {
      // Act
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Products retrieved successfully');
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination).toBeDefined();
    });

    it('should return products with pagination', async () => {
      // Arrange
      MockProductModel.seed([
        productFixtures.laptopProduct,
        productFixtures.smartphoneProduct,
        productFixtures.accessoryProduct
      ]);

      // Act
      const response = await request(app)
        .get('/api/products?page=1&limit=2')
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.itemsPerPage).toBe(2);
    });

    it('should filter products by category', async () => {
      // Arrange
      MockProductModel.seed([
        productFixtures.laptopProduct,
        productFixtures.smartphoneProduct,
        productFixtures.accessoryProduct
      ]);

      // Act
      const response = await request(app)
        .get('/api/products?category=laptops')
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('laptops');
    });

    it('should filter products by price range', async () => {
      // Arrange
      MockProductModel.seed([
        productFixtures.cheapProduct,
        productFixtures.expensiveProduct,
        productFixtures.laptopProduct
      ]);

      // Act
      const response = await request(app)
        .get('/api/products?minPrice=100&maxPrice=1000')
        .expect(200);

      // Assert
      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(100);
        expect(product.price).toBeLessThanOrEqual(1000);
      });
    });

    it('should search products by text', async () => {
      // Arrange
      MockProductModel.seed([productFixtures.laptopProduct]);

      // Act
      const response = await request(app)
        .get('/api/products?search=laptop')
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return 200 and a single product', async () => {
      // Arrange
      MockProductModel.seed([productFixtures.laptopProduct]);
      const createdProduct = MockProductModel.getAll()[0];

      // Act
      const response = await request(app)
        .get(`/api/products/${createdProduct._id}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(productFixtures.laptopProduct.name);
    });

    it('should return 404 when product not found', async () => {
      // Act
      const response = await request(app)
        .get('/api/products/507f1f77bcf86cd799439011')
        .expect(404);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid ObjectId format', async () => {
      // Act
      const response = await request(app)
        .get('/api/products/invalid-id')
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid product ID');
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product (admin only)', async () => {
      // Arrange
      const newProduct = productFixtures.validProduct;

      // Act
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProduct)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product created successfully');
      expect(response.body.data.name).toBe(newProduct.name);
      expect(response.body.data.price).toBe(newProduct.price);
    });

    it('should return 403 for non-admin users', async () => {
      // Arrange
      const newProduct = productFixtures.validProduct;

      // Act
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newProduct)
        .expect(403);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Admin privileges required');
    });

    it('should return 401 when no token provided', async () => {
      // Arrange
      const newProduct = productFixtures.validProduct;

      // Act
      const response = await request(app)
        .post('/api/products')
        .send(newProduct)
        .expect(401);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });

    it('should return 400 for invalid product data (missing name)', async () => {
      // Arrange
      const invalidProduct = productFixtures.invalidMissingName;

      // Act
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidProduct)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid category', async () => {
      // Arrange
      const invalidProduct = productFixtures.invalidCategory;

      // Act
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidProduct)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for negative price', async () => {
      // Arrange
      const invalidProduct = productFixtures.invalidNegativePrice;

      // Act
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidProduct)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update an existing product (admin only)', async () => {
      // Arrange
      MockProductModel.seed([productFixtures.laptopProduct]);
      const existingProduct = MockProductModel.getAll()[0];
      const updateData = productFixtures.updateProduct;

      // Act
      const response = await request(app)
        .put(`/api/products/${existingProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product updated successfully');
      expect(response.body.data.name).toBe(updateData.name);
    });

    it('should return 403 for non-admin users', async () => {
      // Arrange
      MockProductModel.seed([productFixtures.laptopProduct]);
      const existingProduct = MockProductModel.getAll()[0];

      // Act
      const response = await request(app)
        .put(`/api/products/${existingProduct._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name' })
        .expect(403);

      // Assert
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when updating non-existent product', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011';

      // Act
      const response = await request(app)
        .put(`/api/products/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      // Assert
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should soft delete a product (admin only)', async () => {
      // Arrange
      MockProductModel.seed([productFixtures.laptopProduct]);
      const existingProduct = MockProductModel.getAll()[0];

      // Act
      const response = await request(app)
        .delete(`/api/products/${existingProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product deleted successfully');
    });

    it('should return 403 for non-admin users', async () => {
      // Arrange
      MockProductModel.seed([productFixtures.laptopProduct]);
      const existingProduct = MockProductModel.getAll()[0];

      // Act
      const response = await request(app)
        .delete(`/api/products/${existingProduct._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      // Assert
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when deleting non-existent product', async () => {
      // Act
      const response = await request(app)
        .delete('/api/products/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      // Assert
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/products/:id/reviews', () => {
    it('should add a review to a product (authenticated users)', async () => {
      // Arrange
      MockProductModel.seed([{
        ...productFixtures.laptopProduct,
        rating: 4,
        reviewCount: 2
      }]);
      const product = MockProductModel.getAll()[0];

      // Act
      const response = await request(app)
        .post(`/api/products/${product._id}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviews.validReview)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Review added successfully');
      expect(response.body.data.rating).toBeDefined();
    });

    it('should return 401 when no token provided', async () => {
      // Arrange
      MockProductModel.seed([productFixtures.laptopProduct]);
      const product = MockProductModel.getAll()[0];

      // Act
      const response = await request(app)
        .post(`/api/products/${product._id}/reviews`)
        .send(reviews.validReview)
        .expect(401);

      // Assert
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid rating (above 5)', async () => {
      // Arrange
      MockProductModel.seed([productFixtures.laptopProduct]);
      const product = MockProductModel.getAll()[0];

      // Act
      const response = await request(app)
        .post(`/api/products/${product._id}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviews.invalidRating)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent product', async () => {
      // Act
      const response = await request(app)
        .post('/api/products/507f1f77bcf86cd799439011/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reviews.validReview)
        .expect(404);

      // Assert
      expect(response.body.success).toBe(false);
    });
  });

  describe('Health Check', () => {
    it('should return API health status', async () => {
      // Act
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Assert
      expect(response.body.status).toBe('OK');
      expect(response.body.message).toBe('Ecommerce API is running');
    });
  });
});
