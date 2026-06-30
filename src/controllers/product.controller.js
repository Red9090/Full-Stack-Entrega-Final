const productService = require('../services/product.service');

/**
 * Get all products with filtering and pagination
 * GET /api/products
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      search: req.query.search,
      sortBy: req.query.sortBy,
      order: req.query.order,
      page: req.query.page,
      limit: req.query.limit
    };

    const result = await productService.getAllProducts(filters);

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: result.products,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID
 * GET /api/products/:id
 */
exports.getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new product
 * POST /api/products
 */
exports.createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product
 * PUT /api/products/:id
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product
 * DELETE /api/products/:id
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add review to product
 * POST /api/products/:id/reviews
 */
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    
    const result = await productService.addReview(req.params.id, {
      rating,
      comment,
      userId: req.user.id
    });

    res.json({
      success: true,
      message: result.message,
      data: { rating: result.rating }
    });
  } catch (error) {
    next(error);
  }
};
