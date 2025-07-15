import React, { Fragment, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getProductById } from '../api/productService';

const OrderSuccess = () => {
  const location = useLocation();
  const { user } = useUser();
  const [order, setOrder] = useState(null);
  const [isVNPaySuccess, setIsVNPaySuccess] = useState(false);
  const [voucherProcessed, setVoucherProcessed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

 useEffect(() => {
  const fetchResult = async () => {
    const urlParams = new URLSearchParams(location.search);
    const paymentId = urlParams.get('paymentId');
    const payerId = urlParams.get('PayerID');
    const orderId = urlParams.get('orderId');

    if (paymentId && payerId && orderId) {
      try {
        const response = await fetch(`http://localhost:8080/api/orders/payment/paypal/return?paymentId=${paymentId}&PayerID=${payerId}&orderId=${orderId}`);
        const data = await response.json();
        if (data.success && data.data?.order) {
          setOrder(data.data.order);
        } else {
          setOrder(null);
        }
      } catch (error) {
        setOrder(null);
      }
      return;
    }

    // Xử lý callback VNPay
    const responseCode = urlParams.get('vnp_ResponseCode');
    if (responseCode === '00') {
      setIsVNPaySuccess(true);

      try {
        const response = await fetch(`http://localhost:8080/api/orders/payment/vnpay/return${location.search}`);
        console.log("data",response);
        if (response.ok) {
          const data = await response.json();
          
          setOrder(data.order);

          // Xử lý giảm voucher
          const pendingVoucher = localStorage.getItem('pendingVoucher');
          if (pendingVoucher && !voucherProcessed) {
            const { userId, code } = JSON.parse(pendingVoucher);
            const decreaseRes = await fetch(`http://localhost:8080/api/vouchers/decrease?userId=${userId}&code=${code}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' }
            });

            if (decreaseRes.ok) {
              localStorage.removeItem('pendingVoucher');
              setVoucherProcessed(true);
            }
          }
        }
      } catch (error) {
        // handle error
      }
      return;
    }

    // fallback nếu không phải từ VNPay hoặc PayPal
    const savedOrder = localStorage.getItem('lastOrder');
    console.log("savedOrder",savedOrder);
    if (savedOrder) {
      let parsedOrder = JSON.parse(savedOrder);
      // Nếu orderItems chưa có product, fetch product info cho từng item
      if (parsedOrder.orderItems && parsedOrder.orderItems.length > 0 && !parsedOrder.orderItems[0].product) {
        const itemsWithProduct = await Promise.all(
          parsedOrder.orderItems.map(async (item) => {
            const product = await getProductById(item.productId);
            return { ...item, product };
          })
        );
        parsedOrder.orderItems = itemsWithProduct;
      }
      setOrder(parsedOrder);
    }
  };

  fetchResult();
}, [location.search, voucherProcessed]);
  // Countdown timer effect
  useEffect(() => {
    if (!order?.expiredAt) {
      console.log('No expiredAt:', order);
      return;
    }

    console.log('ExpiredAt:', order.expiredAt);

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiredTime = new Date(order.expiredAt).getTime();
      const difference = expiredTime - now;

      console.log('Time difference:', difference);

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      console.log('Time left:', { hours, minutes, seconds });
      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [order?.expiredAt]);

  // Format countdown display
  const formatCountdown = () => {
    console.log('Formatting countdown, timeLeft:', timeLeft);
    if (!timeLeft) return 'Hết thời gian thanh toán';
    return `${timeLeft.hours.toString().padStart(2, '0')}:${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`;
  };

  // Kiểm tra xem đơn hàng có phải thanh toán bằng COD không
  const isCODPayment = () => {
    if (!order) return false;
    return order.paymentStatus === 'Thanh toán khi nhận hàng';
  };

  // Lấy trạng thái thanh toán tương ứng với phương thức thanh toán
  const getPaymentStatusText = () => {
    if (!order) return { text: '', color: '' };
    
    switch (order.paymentStatus) {
      case 'Thanh toán khi nhận hàng':
        return { text: 'Chưa thanh toán', color: 'text-yellow-600' };
      case 'Chờ thanh toán':
        return { text: 'Chờ thanh toán', color: 'text-yellow-600' };
      case 'Đã thanh toán':
        return { text: 'Đã thanh toán', color: 'text-green-600' };
      default:
        return { text: order.paymentStatus, color: 'text-gray-600' };
    }
  };

  // Format payment method display
  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash':
        return 'Tiền mặt';
      case 'vnpay':
        return 'VNPay';
      default:
        return method;
    }
  };

  const paymentStatus = getPaymentStatusText();

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Đặt hàng thành công!</h2>
            <p className="text-gray-600 mb-6">Đơn hàng của bạn đã được đặt thành công.</p>
            <div className="mt-8 flex flex-col space-y-4">
              <Link to="/" className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300">
                Quay lại trang chủ
              </Link>
              <Link to="/user/orders" className="text-purple-600 hover:text-purple-700 transition duration-300">
                Xem đơn hàng của tôi
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };
  console.log(order);
  // Get product image URL safely
  const getProductImageUrl = (item) => {
    if (!item || !item.product) return 'https://placehold.co/200x200?text=No+Image';
    
    if (item.product.productImages && 
        Array.isArray(item.product.productImages) && 
        item.product.productImages.length > 0 && 
        item.product.productImages[0]?.imageUrl) {
      return `http://localhost:8080${item.product.productImages[0].imageUrl}`;
    }
    
    return 'https://placehold.co/200x200?text=No+Image';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {order.paymentStatus === 'Chờ thanh toán' ? (
                <>
                  <h1 className="text-3xl font-bold text-yellow-600 mb-2">Đang đợi thanh toán</h1>
                  <p className="text-gray-600">
                    Đơn hàng của bạn đã được tạo, vui lòng hoàn tất thanh toán để xác nhận đơn hàng.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h1>
                  <p className="text-gray-600">
                    Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn ngay lập tức.
                  </p>
                </>
              )}
            </div>

            <div className="border-t border-b py-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin đơn hàng #{order.orderCode || order.id}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Thông tin người nhận</h3>
                  <p className="text-gray-800 font-medium">{order.receiverName}</p>
                  <p className="text-gray-600">{order.receiverPhone}</p>
                  <p className="text-gray-600">{order.receiverEmail}</p>
                  <p className="text-gray-600">{order.receiverAddress}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Thông tin thanh toán</h3>
                  <p className="text-gray-800">Phương thức: <span className="font-medium">{getPaymentMethodText(order.paymentMethod)}</span></p>
                  <p className="text-gray-800">Tổng tiền: <span className="font-medium text-purple-600">{formatCurrency(order.total)}</span></p>
                  <p className="text-gray-800">Trạng thái: <span className={`font-medium ${paymentStatus.color}`}>{paymentStatus.text}</span></p>
                  {['vnpay', 'paypal'].includes(order.paymentMethod) && order.expiredAt && order.paymentStatus !== "Đã thanh toán" ? (
                    <p className="text-gray-800 mt-2">
                      Thời gian thanh toán: <span className={`font-medium ${timeLeft ? 'text-red-600' : 'text-gray-600'}`}>{formatCountdown()}</span>
                    </p>
                  ) : <Fragment></Fragment>}
                 
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Chi tiết đơn hàng</h2>
              
              {order.orderItems && order.orderItems.map((item, index) => (
                <div key={index} className="flex items-center border-b pb-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img 
                      src={getProductImageUrl(item)}
                      alt={item.product?.name || 'Sản phẩm'}
                      className="h-full w-full object-cover object-center"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/200x200?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-800">
                        <h3>{item.product?.name || 'Sản phẩm không xác định'}</h3>
                        <p className="ml-4">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.size && `Size: ${item.size.name || item.size}`} | Số lượng: {item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-base font-medium text-gray-800">
                  <p>Tổng cộng</p>
                  <p>{formatCurrency(order.total)}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/" className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300 text-center">
                Tiếp tục mua sắm
              </Link>
              <Link to="/user/orders" className="text-purple-600 border border-purple-600 py-2 px-4 rounded-lg hover:bg-purple-50 transition duration-300 text-center">
                Xem đơn hàng của tôi
              </Link>
            </div>
          </div>

          {isVNPaySuccess && voucherProcessed && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-green-700 text-center">
              Mã giảm giá đã được cập nhật thành công.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;