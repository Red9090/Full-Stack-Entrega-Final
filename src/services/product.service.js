const mongoose = require('mongoose');
const Product = require('../models/Product');

class ProductService {
  /**
   * Get all products with filtering, sorting and pagination
   */
  async getAllProducts(filters = {}) {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10
    } = filters;

    // Build query
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    return {
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    };
  }

  /**
   * Get product by ID
   */
  async getProductById(id) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid product ID format');
      error.statusCode = 400;
      throw error;
    }

    const product = await Product.findById(id);

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    return product;
  }

  /**
   * Create a new product
   */
  async createProduct(productData) {
    const product = await Product.create(productData);
    return product;
  }

  /**
   * Update product
   */
  async updateProduct(id, updateData) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid product ID format');
      error.statusCode = 400;
      throw error;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    return product;
  }

  /**
   * Delete product (soft delete)
   */
  async deleteProduct(id) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid product ID format');
      error.statusCode = 400;
      throw error;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    return { message: 'Product deleted successfully' };
  }

  /**
   * Add review to product
   */
  async addReview(productId, reviewData) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const error = new Error('Invalid product ID format');
      error.statusCode = 400;
      throw error;
    }

    const { rating, comment, userId } = reviewData;

    const product = await Product.findById(productId);

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      const error = new Error('Rating must be between 1 and 5');
      error.statusCode = 400;
      throw error;
    }

    // Update rating (simplified - in production you'd store individual reviews)
    const newRating = ((product.rating * product.reviewCount) + rating) / (product.reviewCount + 1);

    product.rating = Math.round(newRating * 10) / 10; // Round to 1 decimal
    product.reviewCount += 1;
    await Product.findByIdAndUpdate(productId, {
      rating: product.rating,
      reviewCount: product.reviewCount
    });

    return { message: 'Review added successfully', rating: product.rating };
  }

  /**
   * Update product stock
   */
  async updateStock(id, quantityChange) {
    const product = await Product.findById(id);

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    const newStock = product.stock + quantityChange;

    if (newStock < 0) {
      const error = new Error('Insufficient stock');
      error.statusCode = 400;
      throw error;
    }

    product.stock = newStock;
    await Product.findByIdAndUpdate(id, { stock: newStock });

    return product;
  }
}

module.exports = new ProductService();
