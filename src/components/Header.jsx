import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import AuthModal from './AuthModal';

const Header = () => {
  const { 
    user, 
    isLoggedIn, 
    logout, 
    isAuthModalOpen, 
    authMode, 
    openLoginModal, 
    openRegisterModal, 
    closeAuthModal 
  } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Debug - check login status
  useEffect(() => {
    console.log('Login status:', isLoggedIn);
    console.log('User data:', user);
  }, [isLoggedIn, user]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const closeDropdown = () => setIsDropdownOpen(false);

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-xl font-bold text-purple-600">
              Fashion Store
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-purple-600">
                Trang chủ
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-purple-600">
                Sản phẩm
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-purple-600">
                Giới thiệu
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-purple-600">
                Liên hệ
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Link to="/cart" className="text-gray-700 hover:text-purple-600 relative">
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                  />
                </svg>
                {/* Cart count badge - replace with actual cart count */}
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  0
                </span>
              </Link>

              {/* Auth Buttons or User Menu */}
              {isLoggedIn && user ? (
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-purple-600 rounded-full text-white flex items-center justify-center">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block font-medium">{user.username}</span>
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 9l-7 7-7-7" 
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={closeDropdown}
                      >
                        Tài khoản
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={closeDropdown}
                      >
                        Đơn hàng
                      </Link>
                      {/* Admin link if user has admin role */}
                      {user.role === 1 && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={closeDropdown}
                        >
                          Quản trị
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          closeDropdown();
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={openLoginModal}
                    className="text-gray-700 hover:text-purple-600"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={openRegisterModal}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-300"
                  >
                    Đăng ký
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authMode}
      />
    </>
  );
};

export default Header; 