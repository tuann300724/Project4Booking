import React, { useState } from 'react';

const AuthModal = ({ open, onClose }) => {
  const [tab, setTab] = useState('login');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex justify-center mb-6 gap-4">
          <button
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${tab === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setTab('login')}
          >
            Đăng nhập
          </button>
          <button
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${tab === 'register' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setTab('register')}
          >
            Đăng ký
          </button>
        </div>
        {tab === 'login' ? (
          <form className="flex flex-col gap-4">
            <input type="email" placeholder="Email" className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600" />
            <input type="password" placeholder="Mật khẩu" className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600" />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 font-semibold mt-2">Đăng nhập</button>
          </form>
        ) : (
          <form className="flex flex-col gap-4">
            <input type="text" placeholder="Họ và tên" className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600" />
            <input type="email" placeholder="Email" className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600" />
            <input type="password" placeholder="Mật khẩu" className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600" />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 font-semibold mt-2">Đăng ký</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal; 