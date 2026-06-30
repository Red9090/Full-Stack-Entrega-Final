/**
 * Mock implementations for external dependencies
 */

const { products } = require('../fixtures/product.fixtures');

// Mock mongoose before any imports
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: (id) => {
        // Accept both numeric string IDs (for mock) and valid MongoDB ObjectIds
        if (!id) return false;
        // Check if it's a valid MongoDB ObjectId format (24 hex characters)
        if (/^[0-9a-fA-F]{24}$/.test(id)) return true;
        // Also accept numeric strings for mock testing
        if (/^\d+$/.test(id)) return true;
        return false;
      }
    }
  },
  Schema: jest.fn(),
  model: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn()
}));

/**
 * Create a mock product document with Mongoose-like methods
 */
function createMockProductDoc(productData) {
  const doc = {
    ...productData,
    save: jest.fn().mockImplementation(async function() {
      return this;
    })
  };
  return doc;
}

/**
 * Mock Product Model
 * Simulates MongoDB/Mongoose Product model behavior
 */
class MockProductModel {
  constructor() {
    this.products = new Map();
    this.idCounter = 1;
  }

  /**
   * Generate a valid MongoDB ObjectId format (24 hex characters)
   */
  generateObjectId() {
    const chars = '0123456789abcdef';
    let id = '';
    for (let i = 0; i < 24; i++) {
      id += chars[Math.floor(Math.random() * 16)];
    }
    return id;
  }

  /**
   * Create a mock product document
   */
  async create(productData) {
    const id = this.generateObjectId();
    const product = createMockProductDoc({
      _id: id,
      ...productData,
      rating: 0,
      reviewCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    this.products.set(id, product);
    return product;
  }

  /**
   * Find all products matching query - returns chainable object
   */
  find(query = {}) {
    let results = Array.from(this.products.values());
    
    // Filter by isActive
    if (query.isActive !== undefined) {
      results = results.filter(p => p.isActive === query.isActive);
    }
    
    // Filter by category
    if (query.category) {
      results = results.filter(p => p.category === query.category);
    }
    
    // Filter by price range
    if (query.price) {
      if (query.price.$gte !== undefined) {
        results = results.filter(p => p.price >= query.price.$gte);
      }
      if (query.price.$lte !== undefined) {
        results = results.filter(p => p.price <= query.price.$lte);
      }
    }
    
    // Return chainable object for Mongoose-like API
    return {
      sort: (sortOptions) => {
        // Sort results
        const [field, direction] = Object.entries(sortOptions)[0];
        results.sort((a, b) => {
          if (direction === 1) {
            return a[field] > b[field] ? 1 : -1;
          } else {
            return a[field] < b[field] ? 1 : -1;
          }
        });
        return {
          skip: (count) => {
            results = results.slice(count);
            return {
              limit: (count) => {
                results = results.slice(0, count);
                return Promise.resolve(results);
              }
            };
          },
          then: (resolve) => resolve(results)
        };
      },
      then: (resolve) => resolve(results)
    };
  }

  /**
   * Find product by ID
   */
  async findById(id) {
    // Try to find by exact ID first
    let product = this.products.get(id);
    
    // If not found and id looks like a counter-based ID, try converting
    if (!product && !isNaN(id)) {
      product = this.products.get(String(id));
    }
    
    return product ? createMockProductDoc(product) : null;
  }

  /**
   * Find by ID and update
   */
  async findByIdAndUpdate(id, updateData, options = {}) {
    // Try to find by exact ID first
    let product = this.products.get(id);
    
    // If not found and id looks like a counter-based ID, try converting
    if (!product && !isNaN(id)) {
      product = this.products.get(String(id));
    }
    
    if (!product) {
      return options.new ? null : product;
    }
    
    // Remove functions from updateData if any
    const updates = { ...updateData };
    delete updates.$set;
    
    const updated = createMockProductDoc({
      ...product,
      ...updates,
      updatedAt: new Date()
    });
    
    if (options.new) {
      this.products.set(id, updated);
      return updated;
    }
    
    return product;
  }

  /**
   * Count documents matching query
   */
  async countDocuments(query = {}) {
    const results = await this.find(query);
    return results.length || 0;
  }

  /**
   * Delete product (soft delete simulation)
   */
  async deleteOne(query) {
    if (query._id) {
      const id = query._id;
      let product = this.products.get(id);
      
      // If not found and id looks like a counter-based ID, try converting
      if (!product && !isNaN(id)) {
        product = this.products.get(String(id));
      }
      
      if (product) {
        // Create updated product with isActive = false
        const updatedProduct = createMockProductDoc({
          ...product,
          isActive: false,
          updatedAt: new Date()
        });
        this.products.set(id, updatedProduct);
        return { deletedCount: 1 };
      }
    }
    return { deletedCount: 0 };
  }

  /**
   * Clear all products (for test cleanup)
   */
  clear() {
    this.products.clear();
    this.idCounter = 1;
  }

  /**
   * Get all stored products (for verification)
   */
  getAll() {
    return Array.from(this.products.values());
  }

  /**
   * Seed with initial data
   */
  seed(initialProducts = []) {
    this.clear();
    initialProducts.forEach(p => {
      // Use the provided _id if it exists, otherwise generate one
      const id = p._id || String(this.idCounter++);
      if (!p._id) {
        this.idCounter++;
      }
      const product = createMockProductDoc({
        _id: id,
        ...p,
        rating: p.rating || 0,
        reviewCount: p.reviewCount || 0,
        isActive: p.isActive !== undefined ? p.isActive : true,
        createdAt: p.createdAt || new Date(),
        updatedAt: p.updatedAt || new Date()
      });
      this.products.set(id, product);
    });
  }
}

/**
 * Mock User Model
 */
class MockUserModel {
  constructor() {
    this.users = new Map();
  }

  async findById(id) {
    return this.users.get(id) || null;
  }

  async create(userData) {
    const id = String(Date.now());
    const user = {
      _id: id,
      ...userData,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  clear() {
    this.users.clear();
  }
}

// Export singleton instances
exports.MockProductModel = new MockProductModel();
exports.MockUserModel = new MockUserModel();
exports.createMockProductDoc = createMockProductDoc;

/**
 * Mock Mongoose connection
 */
exports.mockMongooseConnection = {
  connect: jest.fn().mockResolvedValue({ connection: { host: 'localhost' } }),
  disconnect: jest.fn().mockResolvedValue(undefined)
};

/**
 * Create mock request object
 */
exports.createMockRequest = (overrides = {}) => ({
  params: {},
  query: {},
  body: {},
  headers: {},
  user: null,
  ...overrides
});

/**
 * Create mock response object
 */
exports.createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Create mock next function
 */
exports.createMockNext = () => jest.fn();
