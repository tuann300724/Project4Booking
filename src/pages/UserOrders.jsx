import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const UserOrders = () => {
  const { user, openLoginModal } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      // First check user from context
      let currentUser = user;
      
      // If not in context, try localStorage directly as backup
      if (!currentUser || !currentUser.id) {
        try {
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            currentUser = JSON.parse(savedUser);
          }
        } catch (err) {
          console.error('Error parsing user from localStorage:', err);
        }
      }
      
      // If still no user, show login prompt
      if (!currentUser || !currentUser.id) {
        setError('Bạn cần đăng nhập để xem đơn hàng');
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`http://localhost:8080/api/orders/user/${currentUser.id}`);
        
        // Fetch order items for each order
        const ordersWithItems = await Promise.all(
          response.data.map(async (order) => {
            try {
              const itemsResponse = await axios.get(`http://localhost:8080/api/order-items/order/${order.id}`);
              return { ...order, orderItems: itemsResponse.data };
            } catch (err) {
              console.error(`Error fetching items for order ${order.id}:`, err);
              return { ...order, orderItems: [] };
            }
          })
        );
        
        setOrders(ordersWithItems);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải đơn hàng. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  // Filter orders based on search query
  const filteredOrders = orders.filter(order => 
    order.orderCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Đang xử lý':
        return { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' };
      case 'Xác nhận':
        return { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' };
      case 'in_delivery':
        return { text: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800' };
      case 'completed':
        return { text: 'Hoàn thành', color: 'bg-green-100 text-green-800' };
      case 'Đã hủy':
        return { text: 'Đã hủy', color: 'bg-red-100 text-red-800' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getPaymentStatusInfo = (status) => {
    switch (status) {
      case 'Chờ thanh toán':
        return { text: 'Chờ thanh toán', color: 'bg-orange-100 text-orange-800' };
      case 'Đã thanh toán':
        return { text: 'Đã thanh toán', color: 'bg-green-100 text-green-800' };
      case 'Thanh toán khi nhận hàng':
        return { text: 'Thanh toán khi nhận hàng', color: 'bg-blue-100 text-blue-800' };
      case 'Thanh toán thất bại':
        return { text: 'Thanh toán thất bại', color: 'bg-red-100 text-red-800' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getPaymentMethodInfo = (method) => {
    switch (method) {
      case 'vnpay':
        return { text: 'VNPay', color: 'bg-blue-100 text-blue-800', icon: '💳' };
      case 'cash':
        return { text: 'Tiền mặt', color: 'bg-green-100 text-green-800', icon: '💵' };
      default:
        return { text: method, color: 'bg-gray-100 text-gray-800', icon: '💰' };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  // Format date from ISO string to readable format
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

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Clear search query
  const clearSearch = () => {
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">
              <div className="w-12 h-12 border-4 border-t-purple-600 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
              <p>Đang tải đơn hàng...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="text-center text-red-600 py-8">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold mb-2">{error}</h2>
              {error === 'Bạn cần đăng nhập để xem đơn hàng' ? (
                <div className="mt-4">
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 mr-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Về trang chủ
                  </button>
                  <button 
                    onClick={openLoginModal}
                    className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Đăng nhập
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Thử lại
                </button>
              )}
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
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Đơn hàng của tôi</h1>
          
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 className="text-xl font-semibold mb-2">Bạn chưa có đơn hàng nào</h2>
              <p className="text-gray-600 mb-6">Khám phá các sản phẩm của chúng tôi và đặt hàng ngay!</p>
              <Link 
                to="/products"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Mua sắm ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search Input */}
              <div className="relative bg-white rounded-lg shadow-md p-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo mã đơn hàng..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* No results message */}
              {filteredOrders.length === 0 && searchQuery !== '' && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-xl font-semibold mb-2">Không tìm thấy đơn hàng</h2>
                  <p className="text-gray-600 mb-4">Không tìm thấy đơn hàng nào với mã "{searchQuery}"</p>
                  <button
                    onClick={clearSearch}
                    className="inline-block px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Xóa tìm kiếm
                  </button>
                </div>
              )}

              {/* Orders list */}
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-lg font-medium text-gray-900">Đơn hàng #{order.orderCode}</h2>
                        <p className="text-sm text-gray-600 mt-1">Ngày đặt: {formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(order.status).color}`}>
                          {getStatusInfo(order.status).text}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusInfo(order.paymentStatus).color}`}>
                          {getPaymentStatusInfo(order.paymentStatus).text}
                        </span>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentMethodInfo(order.paymentMethod).color} flex items-center gap-1`}>
                          <span>{getPaymentMethodInfo(order.paymentMethod).icon}</span>
                          <span>{getPaymentMethodInfo(order.paymentMethod).text}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-2">
                        {order.orderItems && order.orderItems.length > 0 ? (
                          <>
                            {order.orderItems.slice(0, 2).map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <div className="flex">
                                  <span className="font-medium">{item.quantity}x</span>
                                  <span className="ml-2 text-gray-700">
                                    {item.product?.name || `Sản phẩm #${item.productId}`}
                                    {item.size && ` - Size ${item.size.name}`}
                                  </span>
                                </div>
                                <span className="text-gray-800 font-medium">{formatCurrency(item.price * item.quantity)}</span>
                              </div>
                            ))}
                            {order.orderItems.length > 2 && (
                              <div className="text-sm text-gray-600">
                                +{order.orderItems.length - 2} sản phẩm khác
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-sm text-gray-600">
                            Không có thông tin sản phẩm
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                        <div className="text-gray-900 font-medium">Tổng cộng:</div>
                        <div className="text-xl font-bold text-purple-600">{formatCurrency(order.total)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-4 flex justify-between">
                    <Link
                      to={`/user/orders/${order.id}`}
                      className="text-purple-600 font-medium hover:text-purple-800 transition-colors"
                    >
                      Xem chi tiết
                    </Link>
                    
                    {order.status === 'completed' && (
                      <button className="text-gray-600 hover:text-gray-800 transition-colors">
                        Mua lại
                      </button>
                    )}
                    
                    {(order.status === 'pending' || order.status === 'Chưa thanh toán') && (
                      <button className="text-red-600 hover:text-red-800 transition-colors">
                        Hủy đơn hàng
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOrders; 