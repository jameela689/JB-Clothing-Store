// models/Product.js

const mongoose = require('mongoose');

// ✅ Sub-schema for inventory variants (embedded document)
const inventorySchema = new mongoose.Schema(
  {
    skuId: {
      type: Number,
      required: true,
      unique: true, // Each SKU must be unique across all products
      index: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    inventory: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    available: {
      type: Boolean,
      default: true,
      index: true // ✅ Query available items quickly
    }
  },
  { _id: false } // ✅ No separate _id for sub-documents (reduces overhead)
);

// ✅ Sub-schema for product images (embedded document)
const imageSchema = new mongoose.Schema(
  {
    view: {
      type: String,
      required: true,
      enum: ['default', 'search', 'front', 'back', 'left', 'right', 'top', 'bottom'],
      trim: true
    },
    src: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

// ✅ Main Product Schema
const productSchema = new mongoose.Schema(
  {
    // Core Identifiers
    productId: {
      type: Number,
      required: [true, 'Product ID is required'],
      unique: true,
      index: true // ✅ PRIMARY: Used in wishlist, cart, URLs
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: 'text' // ✅ Full-text search support
    },
    landingPageUrl: {
      type: String,
      required: true,
      trim: true
    },

    // Brand & Category (High-frequency filters)
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
      index: true // ✅ Filter by brand
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true // ✅ Filter by category (Watches, Shirts, etc.)
    },
    gender: {
      type: String,
      required: true,
      enum: ['Men', 'Women', 'Boys', 'Girls', 'Unisex'],
      index: true // ✅ Gender-based filtering
    },

    // Pricing (Most queried fields)
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
      index: true // ✅ Sort/filter by price
    },
    mrp: {
      type: Number,
      required: [true, 'MRP is required'],
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    effectiveDiscountPercentageAfterTax: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    effectiveDiscountAmountAfterTax: {
      type: Number,
      default: 0,
      min: 0
    },
    discountLabel: {
      type: String,
      trim: true
    },
    discountDisplayLabel: {
      type: String,
      trim: true
    },
    discountType: {
      type: String,
      trim: true
    },

    // Visual Assets
    searchImage: {
      type: String,
      required: [true, 'Search image is required'],
      trim: true
    },
    images: {
      type: [imageSchema],
      validate: {
        validator: function (images) {
          return images && images.length > 0;
        },
        message: 'At least one product image is required'
      }
    },

    // Inventory Management (Embedded for atomicity)
    inventoryInfo: {
      type: [inventorySchema],
      required: true,
      validate: {
        validator: function (inventory) {
          return inventory && inventory.length > 0;
        },
        message: 'At least one inventory variant is required'
      }
    },
    sizes: {
      type: String, // "S, M, L, XL" or "Onesize"
      default: 'Onesize'
    },

    // Product Attributes
    primaryColour: {
      type: String,
      required: true,
      trim: true,
      index: true // ✅ Filter by color
    },
    colorVariantAvailable: {
      type: Boolean,
      default: false
    },
    additionalInfo: {
      type: String,
      trim: true
    },

    // Ratings & Reviews
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true // ✅ Sort by rating
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0
    },

    // Metadata
    season: {
      type: String,
      enum: ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'],
      default: 'All Season'
    },
    year: {
      type: String,
      trim: true
    },
    catalogDate: {
      type: Date,
      default: Date.now
    },

    // System fields
    systemAttributes: {
      type: [String],
      default: []
    },

    // Soft delete support (instead of hard delete)
    isActive: {
      type: Boolean,
      default: true,
      index: true // ✅ Query only active products
    },
    isOutOfStock: {
      type: Boolean,
      default: false,
      index: true // ✅ Filter out-of-stock items
    }
  },
  {
    timestamps: true, // ✅ Auto-generates createdAt & updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ========================================
// INDEXES FOR QUERY OPTIMIZATION
// ========================================

// ✅ Compound index for common filter combinations
productSchema.index({ category: 1, gender: 1, price: 1 });
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ gender: 1, primaryColour: 1 });
productSchema.index({ isActive: 1, isOutOfStock: 1 });

// ✅ Text index for search functionality
productSchema.index({ 
  productName: 'text', 
  brand: 'text', 
  additionalInfo: 'text' 
}, {
  weights: {
    productName: 10,
    brand: 5,
    additionalInfo: 2
  }
});

// ✅ Sorting indexes (most common sorts)
productSchema.index({ price: 1 }); // Low to high
productSchema.index({ price: -1 }); // High to low
productSchema.index({ rating: -1 }); // Highest rated first
productSchema.index({ createdAt: -1 }); // Newest first

// ========================================
// VIRTUALS (Computed fields, not stored)
// ========================================

// Calculate discount percentage on-the-fly
productSchema.virtual('discountPercentage').get(function () {
  if (this.mrp > 0) {
    return Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  return 0;
});

// Get total available inventory across all sizes
productSchema.virtual('totalStock').get(function () {
  return this.inventoryInfo.reduce((total, item) => {
    return total + (item.available ? item.inventory : 0);
  }, 0);
});

// Check if product is in stock
productSchema.virtual('inStock').get(function () {
  return this.totalStock > 0;
});

// Get primary image (default view)
productSchema.virtual('primaryImage').get(function () {
  const defaultImage = this.images.find(img => img.view === 'default');
  return defaultImage ? defaultImage.src : this.searchImage;
});

// ========================================
// MIDDLEWARE (Pre/Post hooks)
// ========================================

// ✅ Auto-update isOutOfStock before saving
productSchema.pre('save', function (next) {
  const totalInventory = this.inventoryInfo.reduce((sum, item) => {
    return sum + (item.available ? item.inventory : 0);
  }, 0);
  
  this.isOutOfStock = totalInventory === 0;
  next();
});

// ✅ Prevent accidental deletion (use soft delete instead)
productSchema.pre('remove', function (next) {
  console.warn(`⚠️ Attempting to delete product ${this.productId}. Consider soft delete instead.`);
  next();
});

// ========================================
// STATIC METHODS (Model-level functions)
// ========================================

// Find products by multiple IDs (for wishlist/cart population)
productSchema.statics.findByProductIds = function (productIds) {
  return this.find({
    productId: { $in: productIds },
    isActive: true
  }).select('productId productName brand price mrp searchImage rating ratingCount');
};

// Get products in stock only
productSchema.statics.findInStock = function (filter = {}) {
  return this.find({
    ...filter,
    isActive: true,
    isOutOfStock: false
  });
};

// Advanced search with filters
productSchema.statics.searchProducts = function (searchQuery, filters = {}) {
  const query = { isActive: true };

  // Text search
  if (searchQuery) {
    query.$text = { $search: searchQuery };
  }

  // Apply filters
  if (filters.category) query.category = filters.category;
  if (filters.brand) query.brand = filters.brand;
  if (filters.gender) query.gender = filters.gender;
  if (filters.color) query.primaryColour = filters.color;
  
  // Price range
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
  }

  // Rating filter
  if (filters.minRating) {
    query.rating = { $gte: Number(filters.minRating) };
  }

  return this.find(query);
};

// ========================================
// INSTANCE METHODS (Document-level functions)
// ========================================

// Check if specific size is available
productSchema.methods.isSizeAvailable = function (sizeLabel) {
  const size = this.inventoryInfo.find(item => item.label === sizeLabel);
  return size && size.available && size.inventory > 0;
};

// Decrease inventory after purchase
productSchema.methods.decreaseInventory = async function (skuId, quantity) {
  const inventoryItem = this.inventoryInfo.find(item => item.skuId === skuId);
  
  if (!inventoryItem) {
    throw new Error('SKU not found');
  }
  
  if (inventoryItem.inventory < quantity) {
    throw new Error('Insufficient inventory');
  }
  
  inventoryItem.inventory -= quantity;
  
  if (inventoryItem.inventory === 0) {
    inventoryItem.available = false;
  }
  
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);