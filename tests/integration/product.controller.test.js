/**
 * Integration Tests for Product Controller
 * Tests the controller layer with mocked service dependencies
 */

const { createMockRequest, createMockResponse, createMockNext } = require('../helpers/mocks');
const { products: productFixtures } = require('../fixtures/product.fixtures');

// Mock the product service BEFORE importing controller
jest.mock('../../src/services/product.service', () => ({
  getAllProducts: jest.fn(),
  getProductById: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
  addReview: jest.fn(),
  updateStock: jest.fn()
}));

const productController = require('../../src/controllers/product.controller');
const mockProductService = require('../../src/services/product.service');

describe('Product Controller - Integration Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    next = createMockNext();
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getAllProducts', () => {
    it('should return products with pagination on success', async () => {
      // Arrange
      const mockProducts = [productFixtures.laptopProduct, productFixtures.smartphoneProduct];
      const mockPagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 10
      };
      
      mockProductService.getAllProducts.mockResolvedValue({
        products: mockProducts,
        pagination: mockPagination
      });

      req.query = { page: '1', limit: '10' };

      // Act
      await productController.getAllProducts(req, res, next);

      // Assert
      expect(mockProductService.getAllProducts).toHaveBeenCalledWith({
        category: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        search: undefined,
        sortBy: undefined,
        order: undefined,
        page: '1',
        limit: '10'
      });
      
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Products retrieved successfully',
        data: mockProducts,
        pagination: mockPagination
      });
    });

    it('should handle service errors correctly', async () => {
      // Arrange
      const error = new Error('Database error');
      error.statusCode = 500;
      mockProductService.getAllProducts.mockRejectedValue(error);

      // Act
      await productController.getAllProducts(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getProductById', () => {
    it('should return a single product on success', async () => {
      // Arrange
      const productId = 'test-product-id';
      req.params.id = productId;
      
      mockProductService.getProductById.mockResolvedValue(productFixtures.laptopProduct);

      // Act
      await productController.getProductById(req, res, next);

      // Assert
      expect(mockProductService.getProductById).toHaveBeenCalledWith(productId);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product retrieved successfully',
        data: productFixtures.laptopProduct
      });
    });

    it('should pass error to next middleware when product not found', async () => {
      // Arrange
      const error = new Error('Product not found');
      error.statusCode = 404;
      mockProductService.getProductById.mockRejectedValue(error);
      req.params.id = 'non-existent-id';

      // Act
      await productController.getProductById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createProduct', () => {
    it('should create a new product and return 201 status', async () => {
      // Arrange
      req.body = productFixtures.validProduct;
      
      mockProductService.createProduct.mockResolvedValue({
        _id: 'new-product-id',
        ...productFixtures.validProduct
      });

      // Act
      await productController.createProduct(req, res, next);

      // Assert
      expect(mockProductService.createProduct).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product created successfully',
        data: expect.objectContaining({
          _id: 'new-product-id',
          name: productFixtures.validProduct.name
        })
      });
    });

    it('should handle validation errors', async () => {
      // Arrange
      req.body = productFixtures.invalidMissingName;
      
      const error = new Error('Validation failed');
      error.statusCode = 400;
      mockProductService.createProduct.mockRejectedValue(error);

      // Act
      await productController.createProduct(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', async () => {
      // Arrange
      req.params.id = 'test-product-id';
      req.body = productFixtures.updateProduct;
      
      const updatedProduct = {
        _id: req.params.id,
        ...productFixtures.laptopProduct,
        ...productFixtures.updateProduct
      };
      
      mockProductService.updateProduct.mockResolvedValue(updatedProduct);

      // Act
      await productController.updateProduct(req, res, next);

      // Assert
      expect(mockProductService.updateProduct).toHaveBeenCalledWith(
        req.params.id,
        req.body
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      });
    });

    it('should handle not found error', async () => {
      // Arrange
      const error = new Error('Product not found');
      error.statusCode = 404;
      mockProductService.updateProduct.mockRejectedValue(error);
      req.params.id = 'non-existent-id';

      // Act
      await productController.updateProduct(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete a product', async () => {
      // Arrange
      req.params.id = 'test-product-id';
      
      mockProductService.deleteProduct.mockResolvedValue({
        message: 'Product deleted successfully'
      });

      // Act
      await productController.deleteProduct(req, res, next);

      // Assert
      expect(mockProductService.deleteProduct).toHaveBeenCalledWith(req.params.id);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product deleted successfully'
      });
    });

    it('should handle not found error', async () => {
      // Arrange
      const error = new Error('Product not found');
      error.statusCode = 404;
      mockProductService.deleteProduct.mockRejectedValue(error);

      // Act
      await productController.deleteProduct(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('addReview', () => {
    it('should add a review to a product', async () => {
      // Arrange
      req.params.id = 'test-product-id';
      req.body = { rating: 5, comment: 'Excellent product!' };
      req.user = { id: 'user-123' };
      
      mockProductService.addReview.mockResolvedValue({
        message: 'Review added successfully',
        rating: 4.5
      });

      // Act
      await productController.addReview(req, res, next);

      // Assert
      expect(mockProductService.addReview).toHaveBeenCalledWith(
        req.params.id,
        {
          rating: 5,
          comment: 'Excellent product!',
          userId: 'user-123'
        }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Review added successfully',
        data: { rating: 4.5 }
      });
    });

    it('should handle invalid rating', async () => {
      // Arrange
      req.params.id = 'test-product-id';
      req.body = { rating: 6, comment: 'Invalid rating' };
      req.user = { id: 'user-123' };
      
      const error = new Error('Rating must be between 1 and 5');
      error.statusCode = 400;
      mockProductService.addReview.mockRejectedValue(error);

      // Act
      await productController.addReview(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
