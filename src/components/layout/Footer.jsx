import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 mt-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 pb-8">
        <div>
          <h3 className="text-xl font-bold mb-2">HotelBooking</h3>
          <p className="text-gray-300">Your perfect stay starts here. Book your dream hotel with us.</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="text-gray-300 hover:text-white transition">Home</Link></li>
            <li><Link to="/about" className="text-gray-300 hover:text-white transition">About</Link></li>
            <li><Link to="/contact" className="text-gray-300 hover:text-white transition">Contact</Link></li>
            <li><Link to="/booking" className="text-gray-300 hover:text-white transition">Đặt phòng</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-2">Contact Us</h4>
          <p className="text-gray-300">Email: info@hotelbooking.com</p>
          <p className="text-gray-300">Phone: +1 234 567 890</p>
          <p className="text-gray-300">Address: 123 Hotel Street, City, Country</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-2">Follow Us</h4>
          <div className="flex gap-4 mt-2">
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">Facebook</a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">Twitter</a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">Instagram</a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-6 text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} HotelBooking. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 