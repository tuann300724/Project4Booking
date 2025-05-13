import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const UserVouchers = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    // Check if user is logged in
    if (!user || !user.id) {
      navigate('/');
      return;
    }

    fetchVouchers();
  }, [user, navigate]);

  // Fetch user vouchers
  const fetchVouchers = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/vouchers/user/${user.id}`);
      setVouchers(response.data);
      
      // Initialize countdown timers
      const initialTimeLeft = {};
      response.data.forEach(voucher => {
        initialTimeLeft[voucher.id] = calculateTimeLeft(voucher.endDate);
      });
      setTimeLeft(initialTimeLeft);
      
      setLoading(false);
    } catch (err) {
      setError('Không thể tải danh sách mã giảm giá. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Calculate time left until voucher expires
  const calculateTimeLeft = (endDate) => {
    const difference = new Date(endDate) - new Date();
    if (difference <= 0) {
      return { expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false
    };
  };

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      const updatedTimeLeft = {};
      vouchers.forEach(voucher => {
        updatedTimeLeft[voucher.id] = calculateTimeLeft(voucher.endDate);
      });
      setTimeLeft(updatedTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [vouchers]);

  // Copy voucher code to clipboard
  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã sao chép mã: ${code}`);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get voucher status
  const getVoucherStatus = (voucher) => {
    if (voucher.used) {
      return { text: 'Đã sử dụng', color: 'bg-gray-100 text-gray-800' };
    }
    
    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);
    
    if (now < startDate) {
      return { text: 'Chưa có hiệu lực', color: 'bg-yellow-100 text-yellow-800' };
    }
    
    if (now > endDate) {
      return { text: 'Hết hạn', color: 'bg-red-100 text-red-800' };
    }
    
    return { text: 'Có hiệu lực', color: 'bg-green-100 text-green-800' };
  };

  // Render countdown timer
  const renderCountdown = (voucherId) => {
    const time = timeLeft[voucherId];
    
    if (!time) return null;
    
    if (time.expired) {
      return <span className="text-red-600 font-medium">Đã hết hạn</span>;
    }
    
    return (
      <div className="flex items-center space-x-2">
        <div className="px-2 py-1 bg-gray-100 rounded text-center">
          <span className="font-mono font-medium">{time.days}</span>
          <div className="text-xs text-gray-500">ngày</div>
        </div>
        <div className="px-2 py-1 bg-gray-100 rounded text-center">
          <span className="font-mono font-medium">{time.hours}</span>
          <div className="text-xs text-gray-500">giờ</div>
        </div>
        <div className="px-2 py-1 bg-gray-100 rounded text-center">
          <span className="font-mono font-medium">{time.minutes}</span>
          <div className="text-xs text-gray-500">phút</div>
        </div>
        <div className="px-2 py-1 bg-gray-100 rounded text-center">
          <span className="font-mono font-medium">{time.seconds}</span>
          <div className="text-xs text-gray-500">giây</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">
              <div className="w-12 h-12 border-4 border-t-purple-600 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Mã giảm giá của tôi</h1>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}
          
          {vouchers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Bạn chưa có mã giảm giá nào</h2>
              <p className="text-gray-600 mb-6">Quay vòng quay may mắn để nhận mã giảm giá</p>
            </div>
          ) : (
            <div className="space-y-6">
              {vouchers.map(voucher => {
                const status = getVoucherStatus(voucher);
                return (
                  <div 
                    key={voucher.id} 
                    className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
                      voucher.used ? 'border-gray-400' : 
                      timeLeft[voucher.id]?.expired ? 'border-red-500' : 'border-green-500'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex flex-wrap md:flex-nowrap justify-between items-start gap-4">
                        <div className="w-full md:w-auto">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-bold text-gray-800">
                              {voucher.discountType === 'percentage' 
                                ? `Giảm ${voucher.discountValue}%` 
                                : `Giảm ${formatCurrency(voucher.discountValue)}`}
                            </h3>
                            <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                              {status.text}
                            </span>
                            {voucher.countCode > 0 && (
                              <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                Còn {voucher.countCode} lần dùng
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center mb-4 bg-gray-100 p-3 rounded-lg">
                            <span className="font-mono font-bold text-purple-700">{voucher.code}</span>
                            <button 
                              onClick={() => copyToClipboard(voucher.code)}
                              className="ml-3 bg-purple-600 text-white text-sm px-2 py-1 rounded hover:bg-purple-700"
                              disabled={voucher.used || timeLeft[voucher.id]?.expired || voucher.countCode === 0}
                            >
                              Sao chép
                            </button>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <p>Thời gian: {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}</p>
                          </div>
                        </div>
                        
                        <div className="w-full md:w-auto text-right">
                          <p className="text-sm text-gray-600 mb-2">Hết hạn sau:</p>
                          {renderCountdown(voucher.id)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserVouchers; 