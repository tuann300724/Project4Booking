import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthModal from './AuthModal';

const Header = () => {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <header className="bg-white shadow fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-700 tracking-tight">
          <Link to="/">HotelBooking</Link>
        </div>
        <nav className="hidden md:block">
          <ul className="flex gap-8 items-center">
            <li><Link to="/" className="text-gray-700 font-medium hover:text-blue-600 transition">Home</Link></li>
            <li><Link to="/about" className="text-gray-700 font-medium hover:text-blue-600 transition">About</Link></li>
            <li><Link to="/contact" className="text-gray-700 font-medium hover:text-blue-600 transition">Contact</Link></li>
            <li><Link to="/booking" className="text-gray-700 font-medium hover:text-blue-600 transition">Đặt phòng</Link></li>
          </ul>
        </nav>
        <div className="flex items-center gap-4">
          <button
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
            onClick={() => setAuthOpen(true)}
          >
            Đăng nhập / Đăng ký
          </button>
        </div>
        {/* Mobile menu icon */}
        <div className="md:hidden">
          <button className="text-2xl text-gray-700">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
};

export default Header; 