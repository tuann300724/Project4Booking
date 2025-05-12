import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { getAllSizes } from '../api/productService';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  const [sizes, setSizes] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'cod'
  });

  useEffect(() => {
    // Lấy danh sách size từ API
    const fetchSizes = async () => {
      try {
        const data = await getAllSizes();
        setSizes(data);
      } catch (err) {
        setSizes([]);
      }
    };
    fetchSizes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Map size name sang id nếu cần
    const orderItems = cart.map(item => {
      let sizeId = item.size;
      // Nếu item.size là tên (S, M, X, XL), map sang id
      if (typeof sizeId === 'string') {
        const found = sizes.find(s => s.name === sizeId);
        if (found) sizeId = found.id;
      }
      return {
        productId: item.id,
        sizeId: sizeId,
        quantity: item.quantity,
        price: item.price
      };
    });

    // Get user ID from context or localStorage
    let userId = user?.id;
    if (!userId) {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          userId = parsedUser.id;
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }

    const orderData = {
      userId: userId || 1, // Use user ID if available, otherwise fallback to 1
      total: calculateTotal(),
      paymentStatus: formData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'VNPay',
      receiverName: formData.fullName,
      receiverEmail: formData.email,
      receiverPhone: formData.phone,
      receiverAddress: `${formData.address}, ${formData.city}`,
      orderItems
    };

    try {
      const res = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      if (res.ok) {
        const order = await res.json();
        
        if (formData.paymentMethod === 'vnpay') {
          // Get VNPay payment URL
          const paymentRes = await fetch(`http://localhost:8080/api/orders/${order.id}/payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (paymentRes.ok) {
            const paymentData = await paymentRes.json();
            // Redirect to VNPay payment page
            window.location.href = paymentData.paymentUrl;
            return;
          } else {
            alert('Không thể tạo thanh toán VNPay. Vui lòng thử lại sau!');
            return;
          }
        }
        
        localStorage.setItem('lastOrder', JSON.stringify(order));
        clearCart();
        navigate('/order-success');
      } else {
        alert('Đặt hàng thất bại!');
      }
    } catch (err) {
      alert('Lỗi kết nối server!');
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-4 border-b">Thông tin giao hàng</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                  placeholder="Nhập họ và tên của bạn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                  placeholder="0123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                  placeholder="Số nhà, tên đường, phường/xã"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thành phố</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                  placeholder="Tên thành phố"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                >
                  <option value="cod">Thanh toán bằng tiền mặt (COD)</option>
                  <option value="vnpay">VNPay</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition duration-300 shadow-md hover:shadow-lg"
              >
                Đặt hàng
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-4 border-b">Đơn hàng của bạn</h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex items-center">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg shadow-sm"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/200x200?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Size: {item.size} | {item.quantity} x {item.price.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-purple-600">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Tạm tính:</span>
                      <span>{calculateTotal().toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Phí vận chuyển:</span>
                      <span className="text-green-600">Miễn phí</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold text-gray-800 pt-2 border-t">
                      <span>Tổng cộng:</span>
                      <span className="text-purple-600">{calculateTotal().toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 