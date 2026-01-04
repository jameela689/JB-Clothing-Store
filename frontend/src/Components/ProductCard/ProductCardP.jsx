import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../WishlistContext/WishlistContext';
import './ProductCardP.css'
export const ProductCard = ({ product, isLoggedIn = false }) => {
  // State for wishlist toggle
  // const [isWishlisted, setIsWishlisted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const isWishlisted = isInWishlist(product.productId)

  const handleWishlistClick = async (e) => {
    e.stopPropagation(); // Prevent card click event
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    console.log("isprocessing===",isProcessing)
    // Prevent rapid clicks
    if (isProcessing) {
      return;
    }

    try {
      setIsProcessing(true);
      await toggleWishlist(product.productId);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);

    } catch (err) {
      console.log("wishlist error=", err);
      alert(err.message || 'Failed to update wishlsit')
    } finally {
      setIsProcessing(false);
    }
  };


  return (

    <div className="product-card">
      <div className="product-image-container">
        <img
          src={product.searchImage}
          alt={product.productName}
          className="product-image"
          loading="lazy"
        />
        {product.discountDisplayLabel && (
          <span className="discount-badge">{product.discountDisplayLabel}</span>
        )}
        {/* NEW: Wishlist Button - Top Right Overlay */}
        <button
          className={`wishlist_btn ${isWishlisted ? 'wishlisted' : ''} ${isProcessing ? 'processing' : ''}`}
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          disabled={isProcessing}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />

          </svg>

          <p className={`wishlist_word ${isWishlisted ? 'wishlisted' : ''}`}>
            {isWishlisted ? 'WISHLISTED' : 'WISHLIST'}
          </p>

        </button>

        {/* Success notification */}
        {showNotification && (
          <div className="wishlist-notification">
            {isWishlisted ? '❤️ Added to Wishlist' : '💔 Removed from Wishlist'}
          </div>
        )}

      </div>

      <div className="product-info">
        <h3 className="product-brand">{product.brand}</h3>
        <p className="product-name">{product.additionalInfo}</p>

        <div className="product-pricing">
          <span className="product-price">₹{product.price}</span>
          {product.mrp > product.price && (
            <>
              <span className="product-mrp">₹{product.mrp}</span>
              <span className="product-discount">
                ({Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF)
              </span>
            </>
          )}
        </div>

        {product.rating > 0 && (
          <div className="product-rating">
            <span className="rating-value">★ {product.rating.toFixed(1)}</span>
            <span className="rating-count">({product.ratingCount})</span>
          </div>
        )}
      </div>
    </div>

  );
};