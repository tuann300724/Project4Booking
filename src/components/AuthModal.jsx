import React, { useState } from 'react';
import axios from 'axios';
import Modal from './Modal';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const switchMode = () => {
    resetForm();
    setIsLoginMode(!isLoginMode);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8080/api/users/login', { email, password });
      console.log('Login successful:', response.data);
      
      // Store user info in localStorage or context
      localStorage.setItem('user', JSON.stringify(response.data));
      
      setSuccessMsg('Đăng nhập thành công!');
      setTimeout(() => {
        onClose();
        // Reload page to update header with user info
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8080/api/users/register', { 
        username, 
        email, 
        password 
      });
      console.log('Registration successful:', response.data);
      
      setSuccessMsg('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
      setTimeout(() => {
        setIsLoginMode(true);
        resetForm();
        setSuccessMsg('');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isLoginMode ? 'Đăng nhập' : 'Đăng ký'}
        </h2>
        <p className="text-gray-600 mt-1">
          {isLoginMode 
            ? 'Chào mừng trở lại!' 
            : 'Tạo tài khoản mới để tiếp tục'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
          {successMsg}
        </div>
      )}

      <form onSubmit={isLoginMode ? handleLogin : handleRegister}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên đăng nhập
          </label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        {!isLoginMode && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition duration-300 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
          ) : null}
          {isLoginMode ? 'Đăng nhập' : 'Đăng ký'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        <p className="text-gray-600">
          {isLoginMode 
            ? 'Chưa có tài khoản?' 
            : 'Đã có tài khoản?'}
          <button
            className="ml-1 text-purple-600 hover:text-purple-800 font-medium"
            onClick={switchMode}
          >
            {isLoginMode ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </p>
      </div>
    </Modal>
  );
};

export default AuthModal; 