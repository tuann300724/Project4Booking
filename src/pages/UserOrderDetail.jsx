import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const UserOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Replace with actual API call once available
        // const response = await axios.get(`http://localhost:8080/api/orders/${id}`);
        // setOrder(response.data);
        
        // Mock data for now
        setTimeout(() => {
          const mockOrder = {
            id: id,
            orderNumber: `ORD-${id}-${Math.floor(Math.random() * 100000)}`,
            date: '15/03/2024',
            status: 'in_delivery',
            totalAmount: 1250000,
            shippingFee: 30000,
            discount: 50000,
            paymentMethod: 'COD',
            shippingInfo: {
              name: 'Nguyễn Văn A',
              phone: '0123456789',
              address: 'Số 123, Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
              note: 'Giao hàng giờ hành chính'
            },
            trackingInfo: [
              { status: 'placed', date: '15/03/2024 08:30', text: 'Đơn hàng đã được đặt' },
              { status: 'confirmed', date: '15/03/2024 09:15', text: 'Đơn hàng đã được xác nhận' },
              { status: 'in_delivery', date: '16/03/2024 11:20', text: 'Đơn hàng đang được giao' }
            ],
            items: [
              { 
                id: 1, 
                name: 'Áo sơ mi trắng', 
                quantity: 2, 
                price: 250000,
                image: '/images/products/shirt.jpg' 
              },
              { 
                id: 2, 
                name: 'Quần jean nam', 
                quantity: 1, 
                price: 750000,
                image: '/images/products/jeans.jpg'
              }
            ]
          };
          setOrder(mockOrder);
          setLoading(false);
        }, 800); // Simulate network delay
      } catch (err) {
        setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: 'clock' };
      case 'confirmed':
        return { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800', icon: 'check' };
      case 'in_delivery':
        return { text: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800', icon: 'truck' };
      case 'completed':
        return { text: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: 'check-circle' };
      case 'cancelled':
        return { text: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: 'x-circle' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800', icon: 'info' };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const getStatusIcon = (icon) => {
    switch (icon) {
      case 'clock':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'check':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'truck':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        );
      case 'check-circle':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'x-circle':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">
              <div className="w-12 h-12 border-4 border-t-purple-600 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
              <p>Đang tải thông tin đơn hàng...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="text-center text-red-600 py-8">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold mb-2">{error || 'Không tìm thấy đơn hàng'}</h2>
              <div className="mt-6">
                <button 
                  onClick={() => navigate('/user/orders')}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Quay lại danh sách đơn hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/user/orders')}
              className="text-gray-600 hover:text-gray-800 flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Chi tiết đơn hàng</h1>
            <div className="w-5"></div> {/* Spacer for alignment */}
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Đơn hàng {order.orderNumber}</h2>
                  <p className="text-sm text-gray-600 mt-1">Ngày đặt: {order.date}</p>
                </div>
                <div>
                  <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                    {getStatusIcon(statusInfo.icon)}
                    <span className="ml-1">{statusInfo.text}</span>
                  </span>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="mb-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="h-1 w-full bg-gray-200 rounded"></div>
                  </div>
                  <div className="relative flex justify-between">
                    {['placed', 'confirmed', 'in_delivery', 'completed'].map((step, index) => {
                      const isCompleted = order.trackingInfo.some(t => t.status === step);
                      const isActive = order.status === step;
                      return (
                        <div key={step} className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isActive 
                              ? 'bg-purple-600 text-white'
                              : isCompleted 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200'
                          }`}>
                            {isCompleted ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>
                          <span className={`text-xs mt-1 ${isActive ? 'font-medium text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                            {step === 'placed' && 'Đặt hàng'}
                            {step === 'confirmed' && 'Xác nhận'}
                            {step === 'in_delivery' && 'Đang giao'}
                            {step === 'completed' && 'Hoàn thành'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="font-medium text-gray-900 mb-4">Sản phẩm đã đặt</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img 
                          src={item.image || 'https://placehold.co/200x200?text=No+Image'} 
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/200x200?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="mt-1 text-sm text-gray-500">Số lượng: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(item.price)}</p>
                        <p className="mt-1 text-sm text-gray-600">
                          Tổng: {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="text-gray-900">{formatCurrency(order.totalAmount + order.discount - order.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giảm giá</span>
                    <span className="text-green-600">-{formatCurrency(order.discount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="text-gray-900">{formatCurrency(order.shippingFee)}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 flex justify-between">
                    <span className="font-medium">Tổng cộng</span>
                    <span className="font-bold text-lg text-purple-600">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer and Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin giao hàng</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Họ tên:</span> {order.shippingInfo.name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Số điện thoại:</span> {order.shippingInfo.phone}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Địa chỉ:</span> {order.shippingInfo.address}
                </p>
                {order.shippingInfo.note && (
                  <p className="text-sm">
                    <span className="font-medium">Ghi chú:</span> {order.shippingInfo.note}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin thanh toán</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Phương thức:</span>{' '}
                  {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Trạng thái:</span>{' '}
                  <span className="text-green-600">Đã xác nhận</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            {order.status === 'pending' && (
              <button className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                Hủy đơn hàng
              </button>
            )}

            <button className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors">
              Liên hệ hỗ trợ
            </button>

            {order.status === 'completed' && (
              <button className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                Đánh giá sản phẩm
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetail; 