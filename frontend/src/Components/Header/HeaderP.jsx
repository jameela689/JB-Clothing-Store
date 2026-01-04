import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext/AuthContext';
import { useWishlist } from '../WishlistContext/WishlistContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import './HeaderP.css';

// ==================== HEADER COMPONENT ====================
export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get('search') || '')
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  
  const { isLoggedIn, logout, loading } = useContext(AuthContext);
  const { wishlistCount } = useWishlist();


  // Add scroll effect to header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    setSearchText(urlSearch);
  }, [searchParams]);

  const handleCategoryClick = (e, category) => {
    e.preventDefault(); // Prevent default anchor behavior
    navigate(`/landingpage?category=${category}`); // Navigate with query param
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedSearch = searchText.trim();
      if (trimmedSearch) {
        const currentCategory = searchParams.get('category')
        const params = new URLSearchParams();
        params.set('search', trimmedSearch);
        if (currentCategory) {
          params.set('category', currentCategory)
        }
        navigate(`/landingpage?${params.toString()}`);

      }
      else {
        const currentCategory = searchParams.get('category');
        if (currentCategory) {
          navigate(`/landingpage?category=${currentCategory}`)
        } else {
          navigate('/landingpage');
        }
      }
    }

  }



  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileDropdown(false);
      navigate('/landingpage'); // Redirect to home
    } catch (error) {
      console.log("Logout error", error)
    }

  };
  if (loading) {
    return null; // Or a skeleton header
  }

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <a href="/landingpage" >
            <h1>JB</h1>
          </a>
        </div>

        {/* Navigation Links */}
        <nav className="nav-links">
          <a
            href="/landingpage?category=men"
            className="nav-link"
            onClick={(e) => handleCategoryClick(e, 'men')}
          >
            Men
          </a>
          <a
            href="/landingpage?category=women"
            className="nav-link"
            onClick={(e) => handleCategoryClick(e, 'women')}
          >
            Women
          </a>
          <a
            href="/landingpage?category=Unisex"
            className="nav-link"
            onClick={(e) => handleCategoryClick(e, 'Unisex')}
          >
            Unisex
          </a>
          <a
            href="/landingpage?category=Girls"
            className="nav-link"
            onClick={(e) => handleCategoryClick(e, 'Girls')}
          >
            Girls
          </a>
        </nav>

        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for products, brands and more"
            className="search-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
        </div>

        {/* Auth Buttons */}
        {/* <div className="auth-buttons">
          <Link to="/login">
            <button className="btn-login">Login</button>
          </Link>
          <Link to="/register">
            <button className="btn-signup">Sign Up</button>
          </Link>
        </div> */}

        {isLoggedIn ? (
          /* LOGGED IN STATE */
          <div className="user-actions">
            {/* Profile Dropdown */}
            <div
              className="profile-wrapper"
              onMouseEnter={() => setShowProfileDropdown(true)}
              onMouseLeave={() => setShowProfileDropdown(false)}
            >
              <button className="action-button">
                <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="action-label">Profile</span>
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <Link to="/orders" className="dropdown-item">
                    <span>📦</span> Orders
                  </Link>
                  <Link to="/addresses" className="dropdown-item">
                    <span>📍</span> Saved Addresses
                  </Link>
                  <Link to="/profile/edit" className="dropdown-item">
                    <span>✏️</span> Edit Profile
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist */}
            {/* <button className="action-button" onClick={() => navigate('/wishlist')}>
              <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="action-label">Wishlist</span>
            </button> */}
            {/* Wishlist with Count Badge */}
            <button className="action-button wishlist-btn-header" onClick={() => navigate('/wishlist')}>
              <div className="icon-wrapper">
                <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="badge">{wishlistCount > 99 ? '99+' : wishlistCount}</span>
                )}
              </div>
              <span className="action-label">Wishlist</span>
            </button>

            {/* Bag */}
            <button className="action-button" onClick={() => navigate('/bag')}>
              <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="action-label">Bag</span>
            </button>
          </div>
        ) : (
          /* LOGGED OUT STATE */
          <div className="user-actions">
            {/* Profile with Login/Signup */}
            <div
              className="profile-container"
              onMouseEnter={() => setShowProfileDropdown(true)}
              onMouseLeave={() => setShowProfileDropdown(false)}
            >
              <button className="action-button">
                <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="action-label">Profile</span>
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <Link to="/login" className="dropdown-item primary">
                    <span>🔐</span> Login
                  </Link>
                  <Link to="/register" className="dropdown-item">
                    <span>📝</span> Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button className="action-button" onClick={() => navigate('/wishlist')}>
              <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="action-label">Wishlist</span>
            </button>

            {/* Bag */}
            <button className="action-button" onClick={() => navigate('/bag')}>
              <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="action-label">Bag</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
