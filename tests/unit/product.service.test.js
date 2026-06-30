/**
 * Unit Tests for Product Service
 * Tests the business logic layer in isolation using mocks
 */

const { MockProductModel } = require('../helpers/mocks');
const { products: productFixtures } = require('../fixtures/product.fixtures');

// Mock the Product model BEFORE importing productService
jest.mock('../../src/models/Product', () => {
  const { MockProductModel } = require('../helpers/mocks');
  return MockProductModel;
});

const productService = require('../../src/services/product.service');

describe('Product Service - Unit Tests', () => {
  beforeEach(() => {
    // Clear mock data before each test
    MockProductModel.clear();
  });

  describe('getAllProducts', () => {
    it('should return all active products with pagination', async () => {
      // Arrange - Seed mock data
      MockProductModel.seed([
        productFixtures.laptopProduct,
        productFixtures.smartphoneProduct,
        productFixtures.accessoryProduct
      ]);

      // Act
      const result = await productService.getAllProducts({
        page: 1,
        limit: 10
      });

      // Assert
      expect(result.products).toHaveLength(3);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalItems).toBe(3);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should filter products by category', async () => {
      // Arrange
      MockProductModel.seed([
        productFixtures.laptopProduct,
        productFixtures.smartphoneProduct,
        productFixtures.accessoryProduct
      ]);

      // Act
      const result = await productService.getAllProducts({
        category: 'laptops',
        page: 1,
        limit: 10
      });

      // Assert
      expect(result.products).toHaveLength(1);
      expect(result.products[0].category).toBe('laptops');
    });

    it('should filter products by price range', async () => {
      // Arrange
      MockProductModel.seed([
        productFixtures.cheapProduct,
        productFixtures.expensiveProduct,
        productFixtures.laptopProduct
      ]);

      // Act
      const result = await productService.getAllProducts({
        minPrice: 100,
        maxPrice: 1000,
        page: 1,
        limit: 10
      });

      // Assert
      expect(result.products).toHaveLength(2);
      result.products.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(100);
        expect(product.price).toBeLessThanOrEqual(1000);
      });
    });

    it('should handle pagination correctly', async () => {
      // Arrange
      MockProductModel.seed([
        productFixtures.laptopProduct,
        productFixtures.smartphoneProduct,
        productFixtures.accessoryProduct,
        productFixtures.cheapProduct,
        productFixtures.expensiveProduct
      ]);

      // Act
      const result = await productService.getAllProducts({
        page: 2,
        limit: 2
      });

      // Assert
      expect(result.products).toHaveLength(2);
      expect(result.pagination.currentPage).toBe(2);
      expect(result.pagination.itemsPerPage).toBe(2);
    });

    it('should only return active products', async () => {
      // Arrange
      MockProductModel.seed([
        productFixtures.laptopProduct,
        { ...productFixtures.smartphoneProduct, isActive: false }
      ]);

      // Act
      const result = await productService.getAllProducts({});

      // Assert
      expect(result.products).toHaveLength(1);
      expect(result.products[0].isActive).toBe(true);
    });
  });

  describe('getProductById', () => {
    it('should return a product by ID', async () => {
      // Arrange
      MockProductModel.seed([productFixtures.laptopProduct]);
      const createdProduct = MockProductModel.getAll()[0];

      // Act
      const product = await productService.getProductById(createdProduct._id);

      // Assert
      expect(product).toBeDefined();
      expect(product.name).toBe(productFixtures.laptopProduct.name);
    });

    it('should throw error when product not found', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id';

      // Act & Assert
      await expect(productService.getProductById(nonExistentId))
        .rejects
        .toThrow('Product not found');
    });
  });

  describe('createProduct', () => {
    it('should create a new product successfully', async () => {
      // Arrange
      const newProductData = productFixtures.validProduct;

      // Act
      const createdProduct = await productService.createProduct(newProductData);

      // Assert
      expect(createdProduct).toBeDefined();
      expect(createdProduct.name).toBe(newProductData.name);
      expect(createdProduct.price).toBe(newProductData.price);
      expect(createdProduct.isActive).toBe(true);
    });

    it('should set default values when creating product', async () => {
      // Arrange
      const minimalProduct = productFixtures.minimalProduct;

      // Act
      const createdProduct = await productService.createProduct(minimalProduct);

      // Assert
      expect(createdProduct.rating).toBe(0);
      expect(createdProduct.reviewCount).toBe(0);
      expect(createdProduct.isActive).toBe(true);
      expect(createdProduct.createdAt).toBeDefined();
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', async () => {
      // Arrange
      MockProductModel.seed([productFixtures.laptopProduct]);
      const existingProduct = MockProductModel.getAll()[0];
      const updateData = productFixtures.updateProduct;

      // Act
      const updatedProduct = await productService.updateProduct(
        existingProduct._id,
        updateData
      );

      // Assert
      expect(updatedProduct.name).toBe(updateData.name);
      expect(updatedProduct.price).toBe(updateData.price);
      expect(updatedProduct.updatedAt).not.toEqual(existingProduct.updatedAt);
    });

    it('should throw error when updating non-existent product', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id';
      const updateData = { name: 'Updated Name' };

      // Act & Assert
      await expect(productService.updateProduct(nonExistentId, updateData))
        .rejects
        .toThrow('Product not found');
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete a product', async () => {
      // Arrange
      MockProductModel.seed([productFixtures.laptopProduct]);
      const existingProduct = MockProductModel.getAll()[0];

      // Act
      const result = await productService.deleteProduct(existingProduct._id);

      // Assert
      expect(result.message).toBe('Product deleted successfully');
      
      // Verify soft delete (product should be inactive)
      const deletedProduct = MockProductModel.findById(existingProduct._id);
      expect(deletedProduct.isActive).toBe(false);
    });

    it('should throw error when deleting non-existent product', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id';

      // Act & Assert
      await expect(productService.deleteProduct(nonExistentId))
        .rejects
        .toThrow('Product not found');
    });
  });

  describe('addReview', () => {
    it('should add a review and update product rating', async () => {
      // Arrange
      MockProductModel.seed([{
        ...productFixtures.laptopProduct,
        rating: 4,
        reviewCount: 2
      }]);
      const product = MockProductModel.getAll()[0];
      const reviewData = {
        rating: 5,
        comment: 'Excellent product!',
        userId: 'user-123'
      };

      // Act
      const result = await productService.addReview(product._id, reviewData);

      // Assert
      expect(result.message).toBe('Review added successfully');
      expect(result.rating).toBeGreaterThan(4);
      
      const updatedProduct = MockProductModel.findById(product._id);
      expect(updatedProduct.reviewCount).toBe(3);
    });

    it('should throw error when adding review to non-existent product', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id';
      const reviewData = {
        rating: 5,
        comment: 'Great!',
        userId: 'user-123'
      };

      // Act & Assert
      await expect(productService.addReview(nonExistentId, reviewData))
        .rejects
        .toThrow('Product not found');
    });
  });

  describe('updateStock', () => {
    it('should increase product stock', async () => {
      // Arrange
      MockProductModel.seed([{
        ...productFixtures.laptopProduct,
        stock: 10
      }]);
      const product = MockProductModel.getAll()[0];

      // Act
      const updatedProduct = await productService.updateStock(product._id, 5);

      // Assert
      expect(updatedProduct.stock).toBe(15);
    });

    it('should decrease product stock', async () => {
      // Arrange
      MockProductModel.seed([{
        ...productFixtures.laptopProduct,
        stock: 10
      }]);
      const product = MockProductModel.getAll()[0];

      // Act
      const updatedProduct = await productService.updateStock(product._id, -3);

      // Assert
      expect(updatedProduct.stock).toBe(7);
    });

    it('should throw error when stock becomes negative', async () => {
      // Arrange
      MockProductModel.seed([{
        ...productFixtures.laptopProduct,
        stock: 5
      }]);
      const product = MockProductModel.getAll()[0];

      // Act & Assert
      await expect(productService.updateStock(product._id, -10))
        .rejects
        .toThrow('Insufficient stock');
    });

    it('should throw error when updating stock of non-existent product', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id';

      // Act & Assert
      await expect(productService.updateStock(nonExistentId, 5))
        .rejects
        .toThrow('Product not found');
    });
  });
});
