import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const UserOrders = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Replace with actual API call once it's available
        // const response = await axios.get(`http://localhost:8080/api/users/${user.id}/orders`);
        // setOrders(response.data);
        
        // Mock data for now
        setTimeout(() => {
          const mockOrders = [
            {
              id: 1,
              date: '15/03/2024',
              status: 'completed',
              totalAmount: 1250000,
              items: [
                { id: 1, name: 'Áo sơ mi trắng', quantity: 2, price: 250000 },
                { id: 2, name: 'Quần jean nam', quantity: 1, price: 750000 }
              ]
            },
            {
              id: 2,
              date: '10/03/2024',
              status: 'in_delivery',
              totalAmount: 560000,
              items: [
                { id: 3, name: 'Áo thun nữ', quantity: 2, price: 180000 },
                { id: 4, name: 'Váy dài', quantity: 1, price: 200000 }
              ]
            },
            {
              id: 3,
              date: '28/02/2024',
              status: 'cancelled',
              totalAmount: 820000,
              items: [
                { id: 5, name: 'Giày thể thao', quantity: 1, price: 820000 }
              ]
            }
          ];
          setOrders(mockOrders);
          setLoading(false);
        }, 800); // Simulate network delay
      } catch (err) {
        setError('Không thể tải đơn hàng. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' };
      case 'confirmed':
        return { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' };
      case 'in_delivery':
        return { text: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800' };
      case 'completed':
        return { text: 'Hoàn thành', color: 'bg-green-100 text-green-800' };
      case 'cancelled':
        return { text: 'Đã hủy', color: 'bg-red-100 text-red-800' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
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
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Thử lại
              </button>
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
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-lg font-medium text-gray-900">Đơn hàng #{order.id}</h2>
                        <p className="text-sm text-gray-600 mt-1">Ngày đặt: {order.date}</p>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(order.status).color}`}>
                          {getStatusInfo(order.status).text}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <div className="flex">
                              <span className="font-medium">{item.quantity}x</span>
                              <span className="ml-2 text-gray-700">{item.name}</span>
                            </div>
                            <span className="text-gray-800 font-medium">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-sm text-gray-600">
                            +{order.items.length - 2} sản phẩm khác
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                        <div className="text-gray-900 font-medium">Tổng cộng:</div>
                        <div className="text-xl font-bold text-purple-600">{formatCurrency(order.totalAmount)}</div>
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
                    
                    {order.status === 'pending' && (
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