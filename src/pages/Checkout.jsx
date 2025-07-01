import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { getAllSizes, validateDiscountCode, checkProductQuantity } from '../api/productService';
import { useSnackbar } from 'notistack';

const Checkout = () => {
  const { cart, clearCart, updateQuantity } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [sizes, setSizes] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [isUserVoucher, setIsUserVoucher] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productQuantities, setProductQuantities] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'cod'
  });

  useEffect(() => {
    // Fetch sizes and check quantities for all items in cart
    const fetchData = async () => {
      try {
        const sizesData = await getAllSizes();
        setSizes(sizesData);

        // Check quantities for all items in cart
        const quantities = {};
        for (const item of cart) {
          let sizeId = item.size;
          let sizeName = item.size;
          if (typeof sizeId === 'string') {
            const found = sizesData.find(s => s.name === sizeId);
            if (found) sizeId = found.id;
          } else if (typeof sizeId === 'object' && sizeId !== null) {
            sizeName = sizeId.name;
            sizeId = sizeId.id;
          }
          try {
            const quantity = await checkProductQuantity(item.product?.id || item.id, sizeName);
            quantities[`${item.product?.id || item.id}-${sizeId}`] = quantity;
          } catch (error) {
            console.error(`Error checking quantity for product ${item.product?.id || item.id}, size ${sizeName}:`, error);
            quantities[`${item.product?.id || item.id}-${sizeId}`] = 0;
          }
        }
        setProductQuantities(quantities);
      } catch (err) {
        console.error('Error fetching data:', err);
        setSizes([]);
      }
    };

    fetchData();
  }, [cart]);

  // Tự động điền thông tin người dùng nếu đã đăng nhập
  useEffect(() => {
    const populateUserData = () => {
      let currentUser = user;

      // Nếu không có user trong context, thử lấy từ localStorage
      if (!currentUser) {
        try {
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            currentUser = JSON.parse(savedUser);
          }
        } catch (err) {
        }
      }

      // Nếu có thông tin user, điền vào form
      if (currentUser) {
        setFormData(prev => ({
          ...prev,
          fullName: currentUser.username || currentUser.full_name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          address: currentUser.address || '',
        }));
      }
    };

    populateUserData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      // First try product discount
      const discount = await validateDiscountCode(discountCode);
      setAppliedDiscount(discount);
      setIsUserVoucher(false);
      setDiscountError('');
    } catch (err) {
      // If product discount fails, try user voucher
      if (user?.id) {
        try {
          const response = await fetch(`http://localhost:8080/api/vouchers/use?userId=${user.id}&code=${discountCode}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const voucher = await response.json();
            setAppliedDiscount(voucher);
            setIsUserVoucher(true);
            setDiscountError('');
          } else {
            const errorData = await response.text();
            setDiscountError(errorData);
            setAppliedDiscount(null);
          }
        } catch (voucherErr) {
          setDiscountError('Không thể kiểm tra mã giảm giá. Vui lòng thử lại.');
          setAppliedDiscount(null);
        }
      } else {
        setDiscountError('Bạn cần đăng nhập để sử dụng mã giảm giá cá nhân');
        setAppliedDiscount(null);
      }
    }
  };

  const calculateDiscountedTotal = () => {
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    
    if (!appliedDiscount) return subtotal;

    const discountType = appliedDiscount.discount_type || appliedDiscount.discountType;
    const discountValue = appliedDiscount.discount_value || appliedDiscount.discountValue;

    if (discountType === 'percentage') {
      return subtotal * (1 - discountValue / 100);
    } else {
      return Math.max(0, subtotal - discountValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Kiểm tra số lượng tồn kho trước khi đặt hàng
    console.log('productQuantities:', productQuantities); // Debug log
    for (const item of cart) {
      let sizeId = item.size;
      if (typeof sizeId === 'string') {
        const found = sizes.find(s => s.name === sizeId);
        if (found) sizeId = found.id;
      } else if (typeof sizeId === 'object' && sizeId !== null) {
        sizeId = sizeId.id;
      }
      
      const key = `${item.product?.id || item.id}-${sizeId}`;
      const availableQuantity = productQuantities[key] || 0;
      
      console.log(`Checking item:`, {
        productId: item.product?.id || item.id,
        sizeId: sizeId,
        sizeName: item.size?.name || item.size,
        requestedQuantity: item.quantity,
        availableQuantity: availableQuantity,
        key: key
      });
      
      if (item.quantity > availableQuantity) {
        setIsSubmitting(false);
        enqueueSnackbar(
          `Sản phẩm "${item.product?.name || 'Không xác định'}" size ${item.size?.name || item.size} không đủ số lượng. Còn lại: ${availableQuantity}, Yêu cầu: ${item.quantity}`, 
          { variant: 'error' }
        );
        return;
      }
    }
    
    // Map size name sang id nếu cần
    const orderItems = cart.map(item => {
      let sizeId = item.size;
      if (typeof sizeId === 'object' && sizeId !== null) {
        sizeId = sizeId.id;
      } else if (typeof sizeId === 'string') {
        const found = sizes.find(s => s.name === sizeId);
        if (found) sizeId = found.id;
      }
      return {
        productId: item.product?.id || item.id,
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
      }
    }

    const orderData = {
      userId: userId || 1,
      total: calculateDiscountedTotal(),
      paymentMethod: formData.paymentMethod === 'cod' ? 'cash' : 
                    formData.paymentMethod === 'vnpay' ? 'vnpay' : 'paypal',
      paymentStatus: formData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chờ thanh toán',
      status: 'Đang xử lý',
      receiverName: formData.fullName,
      receiverEmail: formData.email,
      receiverPhone: formData.phone,
      receiverAddress: `${formData.address}, ${formData.city}`,
      orderItems,
      discountCode: appliedDiscount?.code,
      isUserVoucher: isUserVoucher
    };

    try {
      if (formData.paymentMethod === 'vnpay') {
        await handleVNPayPayment(orderData);
      } else if (formData.paymentMethod === 'paypal') {
        await handlePayPalPayment(orderData);
      } else {
        await handleCODPayment(orderData);
      }
    } catch (err) {
      alert('Lỗi kết nối server!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVNPayPayment = async (orderData) => {
    try {
      // Create order first
      const res = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Không thể tạo đơn hàng: ${errorData}`);
      }

      const order = await res.json();
      
      if (!order || !order.id || !order.total) {
        throw new Error('Dữ liệu đơn hàng không hợp lệ');
      }

      // For VNPay, we'll decrease voucher count after payment is successful
      // Store voucher info in localStorage to use it after payment return
      if (isUserVoucher && appliedDiscount?.code && user?.id) {
        localStorage.setItem('pendingVoucher', JSON.stringify({
          userId: user.id,
          code: appliedDiscount.code
        }));
      }

      // Generate unique transaction ID
      const transactionId = `ORDER_${order.id}_${Date.now()}`;

      // Get VNPay payment URL
      const paymentRes = await fetch(`http://localhost:8080/api/orders/${order.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: order.total,
          orderInfo: `Thanh toan don hang #${order.id}`,
          returnUrl: `http://localhost:5173/order-success`,
          transactionId: transactionId
        })
      });

      if (!paymentRes.ok) {
        const errorData = await paymentRes.text();
        console.error('VNPay payment response error:', errorData);
        throw new Error(`Không thể tạo thanh toán VNPay: ${errorData}`);
      }

      const paymentData = await paymentRes.json();
      console.log('VNPay payment response:', paymentData); // Debug log

      if (!paymentData.success || !paymentData.data?.paymentUrl) {
        console.error('Invalid payment data:', paymentData);
        throw new Error('Không nhận được URL thanh toán từ VNPay');
      }

      // Save order to localStorage and redirect to VNPay
      localStorage.setItem('lastOrder', JSON.stringify({
        ...order,
        orderItems: orderData.orderItems,
        transactionId: transactionId
      }));
      clearCart();
      
      // Open VNPay in new window and handle the return URL
      const paymentWindow = window.open(paymentData.data.paymentUrl, '_blank');
      if (paymentWindow) {
        paymentWindow.focus();
        // Add event listener to handle window close
        const checkWindow = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkWindow);
            // Redirect to OrderSuccess page
            navigate('/order-success');
          }
        }, 1000);
      } else {
        // Fallback if popup is blocked - redirect directly
        window.location.href = paymentData.data.paymentUrl;
      }
    } catch (error) {
      console.error('VNPay error details:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      alert(error.message || 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau!');
    }
  };

  const handlePayPalPayment = async (orderData) => {
    try {
      // Create order first
      const res = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Không thể tạo đơn hàng: ${errorData}`);
      }

      const order = await res.json();
      
      if (!order || !order.id || !order.total) {
        throw new Error('Dữ liệu đơn hàng không hợp lệ');
      }

      // For PayPal, we'll decrease voucher count after payment is successful
      // Store voucher info in localStorage to use it after payment return
      if (isUserVoucher && appliedDiscount?.code && user?.id) {
        localStorage.setItem('pendingVoucher', JSON.stringify({
          userId: user.id,
          code: appliedDiscount.code
        }));
      }

      // Get PayPal payment URL
      const paymentRes = await fetch(`http://localhost:8080/api/orders/${order.id}/payment/paypal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnUrl: `http://localhost:5173/order-success`,
          cancelUrl: `http://localhost:5173/checkout`
        })
      });

      if (!paymentRes.ok) {
        const errorData = await paymentRes.text();
        console.error('PayPal payment response error:', errorData);
        throw new Error(`Không thể tạo thanh toán PayPal: ${errorData}`);
      }

      const paymentData = await paymentRes.json();
      console.log('PayPal payment response:', paymentData); // Debug log

      if (!paymentData.success || !paymentData.data?.paymentUrl) {
        console.error('Invalid payment data:', paymentData);
        throw new Error('Không nhận được URL thanh toán từ PayPal');
      }

      // Save order to localStorage and redirect to PayPal
      localStorage.setItem('lastOrder', JSON.stringify({
        ...order,
        orderItems: orderData.orderItems,
        paymentMethod: 'paypal'
      }));
      clearCart();
      
      // Open PayPal in new window and handle the return URL
      const paymentWindow = window.open(paymentData.data.paymentUrl, '_blank');
      if (paymentWindow) {
        paymentWindow.focus();
        // Add event listener to handle window close
        const checkWindow = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkWindow);
            // Redirect to OrderSuccess page
            navigate('/order-success');
          }
        }, 1000);
      } else {
        // Fallback if popup is blocked - redirect directly
        window.location.href = paymentData.data.paymentUrl;
      }
    } catch (error) {
      console.error('PayPal error details:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      alert(error.message || 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau!');
    }
  };

  const handleCODPayment = async (orderData) => {
    try {
      const res = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Không thể tạo đơn hàng: ${errorData}`);
      }

      const order = await res.json();
      
      // For COD, payment is considered successful upon order creation
      // Decrease voucher count if user voucher was applied
      if (isUserVoucher && appliedDiscount?.code && user?.id) {
        try {
          await fetch(`http://localhost:8080/api/vouchers/decrease?userId=${user.id}&code=${appliedDiscount.code}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (voucherErr) {
          console.error('Error decreasing voucher count:', voucherErr);
        }
      }
      
      localStorage.setItem('lastOrder', JSON.stringify({
        ...order,
        orderItems: orderData.orderItems
      }));
      clearCart();
      navigate('/order-success');
    } catch (error) {
      console.error('COD error:', error);
      alert(error.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau!');
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity <= 0) {
      return;
    }
    updateQuantity(item.id, newQuantity);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-purple-600 border-gray-200 rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Đang xử lý đơn hàng...</p>
            <p className="text-sm text-gray-500 mt-2">Vui lòng không đóng trang này.</p>
          </div>
        </div>
      )}

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
                <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                >
                  <option value="cod">Thanh toán bằng tiền mặt (COD)</option>
                  <option value="vnpay">VNPay</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-purple-600 text-white py-3 rounded-lg transition duration-300 shadow-md hover:shadow-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-purple-700'}`}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-4 border-b">Đơn hàng của bạn</h2>
              <div className="space-y-4">
                {cart.map((item) => {
                  let sizeId = item.size;
                  if (typeof sizeId === 'string') {
                    const found = sizes.find(s => s.name === sizeId);
                    if (found) sizeId = found.id;
                  }
                  const availableQuantity = productQuantities[`${item.product?.id || item.id}-${sizeId}`] || 0;
                  
                  return (
                    <div key={`${item.product?.id || item.id}-${item.size}`} className="flex items-center">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <img
                          src={item.product?.image || 'https://placehold.co/200x200?text=No+Image'}
                          alt={item.product?.name || 'Product'}
                          className="w-full h-full object-cover rounded-lg shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/200x200?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="ml-4 flex-grow">
                        <h3 className="font-medium text-gray-800">{item.product?.name}</h3>
                        <p className="text-sm text-gray-600">
                          Size: {item.size?.name || item.size} | {item.quantity} x {item.price.toLocaleString('vi-VN')}đ
                        </p>
                        <div className="flex items-center mt-2">
                        
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-purple-600">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Discount Code Section */}
                <div className="pt-4 border-t">
                  <div className="mb-4">
                    <h3 className="text-md font-semibold text-gray-800 mb-2">Mã giảm giá</h3>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        placeholder="Nhập mã giảm giá"
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleApplyDiscount}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-300"
                      >
                        Áp dụng
                      </button>
                    </div>
                    {discountError && (
                      <p className="mt-2 text-red-600 text-sm">{discountError}</p>
                    )}
                    {appliedDiscount && (
                      <p className="mt-2 text-green-600 text-sm">
                        Đã áp dụng {isUserVoucher ? 'voucher' : 'mã giảm giá'}: {appliedDiscount.code}
                      </p>
                    )}
                  </div>
                </div>

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
                    {appliedDiscount && (
                      <div className="flex justify-between text-gray-600">
                        <span>Giảm giá:</span>
                        <span className="text-green-600">
                          {(calculateTotal() - calculateDiscountedTotal()).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-semibold text-gray-800 pt-2 border-t">
                      <span>Tổng cộng:</span>
                      <span className="text-purple-600">
                        {(appliedDiscount ? calculateDiscountedTotal() : calculateTotal()).toLocaleString('vi-VN')}đ
                      </span>
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