const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware');
const { 
  createProductRules, 
  updateProductRules, 
  productIdParam, 
  addReviewRules,
  getProductQueryRules,
  handleValidationErrors 
} = require('../validators/product.validator');

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering and pagination
 * @access  Public
 */
router.get('/', getProductQueryRules, handleValidationErrors, productController.getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:id', productIdParam, handleValidationErrors, productController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Admin only)
 */
router.post('/', [authMiddleware, isAdmin], createProductRules, handleValidationErrors, productController.createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (Admin only)
 */
router.put('/:id', [authMiddleware, isAdmin], updateProductRules, handleValidationErrors, productController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Private (Admin only)
 */
router.delete('/:id', [authMiddleware, isAdmin], productController.deleteProduct);

/**
 * @route   POST /api/products/:id/reviews
 * @desc    Add review to product
 * @access  Private (Authenticated users)
 */
router.post('/:id/reviews', authMiddleware, addReviewRules, handleValidationErrors, productController.addReview);

module.exports = router;
