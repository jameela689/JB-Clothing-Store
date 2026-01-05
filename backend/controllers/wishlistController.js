const User = require('../models/User');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;
    const productExists = await Product.findOne({ productId });
    if (!productExists) {
        res.status(404);
        throw new Error('Product not Found');
    };
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $addToSet: { wishlist: productExists._id }
        },
        {
            new: true,
            runValidators: true
        }
    ).select('wishlist');

    const wasAdded = user.wishlist.some(
        (id) => id.toString() === productExists._id.toString()
    );

    res.status(wasAdded ? 200 : 201).json({
        success: true,
        message: wasAdded ? 'Product already in wishlist' : 'Product added to wishlist',
        wishlist: user.wishlist,
        wishlistCount: user.wishlist.length
    });

});
const removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    // ✅ Find product ObjectId
    const product = await Product.findOne({ productId }).select('_id');
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // ✅ Use $pull to remove product (atomic operation)
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $pull: { wishlist: product._id }
        },
        { new: true }
    ).select('wishlist');

    res.status(200).json({
        success: true,
        message: 'Product removed from wishlist',
        wishlist: user.wishlist,
        wishlistCount: user.wishlist.length
    });
});

// @desc    Get user's wishlist with full product details
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;
  
    // ✅ Populate wishlist with product details
    const user = await User.findById(userId)
      .select('wishlist')
      .populate({
        path: 'wishlist',
        select: 'productId productName brand price mrp discountDisplayLabel searchImage additionalInfo rating ratingCount category stock',
        options: { sort: { createdAt: -1 } } // ✅ Most recently added first
      });
  
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
  
    // ✅ Filter out any null values (in case products were deleted)
    const wishlistProducts = user.wishlist.filter((product) => product !== null);
  
    res.status(200).json({
      success: true,
      message: 'Wishlist retrieved successfully',
      wishlist: wishlistProducts,
      wishlistCount: wishlistProducts.length
    });
  });
  
  // @desc    Clear entire wishlist
  // @route   DELETE /api/wishlist
  // @access  Private
  const clearWishlist = asyncHandler(async (req, res) => {
    const userId = req.user._id;
  
    await User.findByIdAndUpdate(
      userId,
      { $set: { wishlist: [] } },
      { new: true }
    );
  
    res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully',
      wishlist: [],
      wishlistCount: 0
    });
  });
  
  module.exports = {
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    clearWishlist
  };
  

