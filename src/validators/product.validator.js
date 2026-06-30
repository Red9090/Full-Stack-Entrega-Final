const { body, param, query } = require('express-validator');

/**
 * Validation rules for creating a product
 */
exports.createProductRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 100 }).withMessage('Product name cannot exceed 100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Product description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  
  body('price')
    .notEmpty().withMessage('Product price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('category')
    .notEmpty().withMessage('Product category is required')
    .isIn(['laptops', 'smartphones', 'accessories', 'tablets', 'wearables', 'other'])
    .withMessage('Invalid category'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  
  body('brand')
    .optional()
    .trim(),
  
  body('images')
    .optional()
    .isArray({ max: 5 }).withMessage('Maximum 5 images allowed'),
  
  body('images.*')
    .optional()
    .isURL().withMessage('Each image must be a valid URL')
];

/**
 * Validation rules for updating a product
 */
exports.updateProductRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Product name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('category')
    .optional()
    .isIn(['laptops', 'smartphones', 'accessories', 'tablets', 'wearables', 'other'])
    .withMessage('Invalid category'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean')
];

/**
 * Validation rules for product ID parameter
 */
exports.productIdParam = [
  param('id')
    .notEmpty().withMessage('Product ID is required')
    .matches(/^[0-9a-fA-F]{24}$/).withMessage('Invalid product ID format')
];

/**
 * Validation rules for adding a review
 */
exports.addReviewRules = [
  param('id')
    .notEmpty().withMessage('Product ID is required')
    .matches(/^[0-9a-fA-F]{24}$/).withMessage('Invalid product ID format'),
  
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters')
];

/**
 * Validation rules for query parameters (filtering, pagination)
 */
exports.getProductQueryRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Maximum price must be a positive number'),
  
  query('category')
    .optional()
    .isIn(['laptops', 'smartphones', 'accessories', 'tablets', 'wearables', 'other'])
    .withMessage('Invalid category'),
  
  query('sortBy')
    .optional()
    .isIn(['name', 'price', 'rating', 'createdAt']).withMessage('Invalid sort field'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
];

/**
 * Middleware to handle validation errors
 */
exports.handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};
