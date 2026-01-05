const express = require('express');
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  clearWishlist
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ All wishlist routes are protected
router.use(protect);

// @route   GET /api/wishlist
router.get('/', getWishlist);

// @route   POST /api/wishlist/:productId
router.post('/:productId', addToWishlist);

// @route   DELETE /api/wishlist/:productId
router.delete('/:productId', removeFromWishlist);

// @route   DELETE /api/wishlist (clear all)
router.delete('/', clearWishlist);

module.exports = router;