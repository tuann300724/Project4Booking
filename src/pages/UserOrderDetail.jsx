import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import axios from "axios";

const UserOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const fetchOrderDetails = async () => {
    try {
      // Fetch order details
      const orderResponse = await axios.get(
        `http://localhost:8080/api/orders/${id}`
      );
      setOrder(orderResponse.data);
      
      // Fetch order items
      const itemsResponse = await axios.get(
        `http://localhost:8080/api/order-items/order/${id}`
      );
      setOrderItems(itemsResponse.data);
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  // Add countdown timer effect
  useEffect(() => {
    if (!order?.expiredAt) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiredTime = new Date(order.expiredAt).getTime();
      const difference = expiredTime - now;

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [order?.expiredAt]);

  // Format countdown display
  const formatCountdown = () => {
    if (!timeLeft) return 'Hết thời gian thanh toán';
    return `${timeLeft.hours.toString().padStart(2, '0')}:${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`;
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "Đang xử lý":
        return {
          text: "Chờ xác nhận",
          color: "bg-yellow-100 text-yellow-800",
          icon: "clock",
        };
      case "Xác nhận":
        return {
          text: "Đã xác nhận",
          color: "bg-blue-100 text-blue-800",
          icon: "check",
        };
      case "in_delivery":
        return {
          text: "Đang giao hàng",
          color: "bg-purple-100 text-purple-800",
          icon: "truck",
        };
      case "completed":
        return {
          text: "Hoàn thành",
          color: "bg-green-100 text-green-800",
          icon: "check-circle",
        };
      case "Đã hủy":
        return {
          text: "Đã hủy",
          color: "bg-red-100 text-red-800",
          icon: "x-circle",
        };
      default:
        return {
          text: status,
          color: "bg-gray-100 text-gray-800",
          icon: "info",
        };
    }
  };

  const getPaymentStatusInfo = (status) => {
    switch (status) {
      case 'Chờ thanh toán':
        return { text: 'Chờ thanh toán', color: 'bg-orange-100 text-orange-800', icon: 'clock' };
      case 'Đã thanh toán':
        return { text: 'Đã thanh toán', color: 'bg-green-100 text-green-800', icon: 'check-circle' };
      case 'Thanh toán khi nhận hàng':
        return { text: 'Thanh toán khi nhận hàng', color: 'bg-blue-100 text-blue-800', icon: 'cash' };
      case 'Thanh toán thất bại':
        return { text: 'Thanh toán thất bại', color: 'bg-red-100 text-red-800', icon: 'x-circle' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800', icon: 'info' };
    }
  };

  const getPaymentMethodInfo = (method) => {
    switch (method) {
      case 'vnpay':
        return { text: 'VNPay', color: 'bg-blue-100 text-blue-800', icon: 'credit-card' };
      case 'cash':
        return { text: 'Tiền mặt', color: 'bg-green-100 text-green-800', icon: 'cash' };
      default:
        return { text: method, color: 'bg-gray-100 text-gray-800', icon: 'money' };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  // Format date from ISO string to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOrderReceived = async () => {
    setUpdating(true);
    try {
      // Update order status to completed
      await axios.put(`http://localhost:8080/api/orders/${id}/status`, {
        status: "Đã thanh toán",
      });
      
      // Update payment status if it's COD
      if (order.paymentMethod === "COD") {
        await axios.put(`http://localhost:8080/api/orders/${id}/payment`, {
          paymentStatus: "paid",
        });
      }
      
      setUpdateSuccess(true);
      // Refresh order details
      await fetchOrderDetails();
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePayAgain = async (method) => {
    try {
      if (order.paymentStatus === 'Đã thanh toán') {
        alert('Đơn hàng này đã được thanh toán!');
        return;
      }

      let paymentUrl = '';
      if (method === 'vnpay') {
        // Gọi API lấy lại link VNPay
        const response = await axios.post(
          `http://localhost:8080/api/orders/${order.id}/retry-payment`,
          {},
          { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
        );
        paymentUrl = response.data.paymentUrl;
      } else if (method === 'paypal') {
        // Gọi API lấy lại link PayPal
        const response = await axios.post(
          `http://localhost:8080/api/orders/${order.id}/retry-payment/paypal`,
          {
            returnUrl: `http://localhost:5173/order-success`,
            cancelUrl: `http://localhost:5173/user/orders/${order.id}`
          },
          { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
        );
        paymentUrl = response.data.data?.paymentUrl;
      }

      if (!paymentUrl) throw new Error('Không nhận được URL thanh toán');

      localStorage.setItem('lastOrder', JSON.stringify({
        ...order,
        orderItems: orderItems
      }));

      // Redirect trực tiếp thay vì mở tab mới
      window.location.href = paymentUrl;
    } catch (error) {
      alert(error.response?.data || error.message || 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau!');
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn huỷ đơn hàng này?")) return;
    setUpdating(true);
    try {
      await axios.put(`http://localhost:8080/api/orders/${id}/cancel`);
      setUpdateSuccess(true);
      await fetchOrderDetails();
    } catch (err) {
      setError("Không thể huỷ đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (icon) => {
    switch (icon) {
      case "clock":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "check":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "truck":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
            />
          </svg>
        );
      case "check-circle":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "x-circle":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "info":
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
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
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold mb-2">
                {error || "Không tìm thấy đơn hàng"}
              </h2>
              <div className="mt-6">
                <button 
                  onClick={() => navigate("/user/orders")}
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

  // Calculate order summary
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = order.discount || 0;
  const shippingFee = order.shippingFee || 0;
  const total = order.total || subtotal + shippingFee - discount;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate("/user/orders")}
              className="text-gray-600 hover:text-gray-800 flex items-center"
            >
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Quay lại
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Chi tiết đơn hàng
            </h1>
            <div className="w-5"></div> {/* Spacer for alignment */}
          </div>

          {updateSuccess && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6"
              role="alert"
            >
              <strong className="font-bold">Thành công! </strong>
              <span className="block sm:inline">
                Đã cập nhật trạng thái đơn hàng.
              </span>
              <span
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                onClick={() => setUpdateSuccess(false)}
              >
                <svg
                  className="fill-current h-6 w-6 text-green-500"
                  role="button"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <title>Đóng</title>
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                </svg>
              </span>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Đơn hàng #{order.orderCode}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Ngày đặt: {formatDate(order.createdAt)}
                  </p>
                </div>
                <div>
                  <span
                    className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
                  >
                    {getStatusIcon(statusInfo.icon)}
                    <span className="ml-1">{statusInfo.text}</span>
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="font-medium text-gray-900 mb-4">
                  Sản phẩm đã đặt
                </h3>
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img 
                          src={
                            item.product?.imageUrls?.[0] ||
                            "https://placehold.co/200x200?text=No+Image"
                          }
                          alt={item.product?.name}
                          className="h-full w-full object-cover object-center"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/200x200?text=No+Image";
                          }}
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.product?.name}
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Size: {item.size?.name} | Số lượng: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(item.price)}
                        </p>
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
                  {/* <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giảm giá</span>
                    <span className="text-green-600">-{formatCurrency(discount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="text-gray-900">{formatCurrency(shippingFee)}</span>
                  </div> */}
                  <div className="pt-4 flex justify-between">
                    <span className="font-medium">Tổng cộng</span>
                    <span className="font-bold text-lg text-purple-600">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer and Shipping Info */}
          {order.shippingInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Thông tin giao hàng
                </h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Họ tên:</span>{" "}
                    {order.shippingInfo.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Số điện thoại:</span>{" "}
                    {order.shippingInfo.phone}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Địa chỉ:</span>{" "}
                    {order.shippingInfo.address}
                  </p>
                  {order.shippingInfo.note && (
                    <p className="text-sm">
                      <span className="font-medium">Ghi chú:</span>{" "}
                      {order.shippingInfo.note}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Thông tin thanh toán
                </h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Phương thức:</span>{" "}
                    {order.paymentMethod === "COD"
                      ? "Thanh toán khi nhận hàng"
                      : order.paymentMethod}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Trạng thái thanh toán:</span>{" "}
                    <span
                      className={
                        order.paymentStatus === "paid"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }
                    >
                      {order.paymentStatus === "paid"
                        ? "Chờ thanh toán"
                        : "Chưa thanh toán"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            {['vnpay', 'paypal'].includes(order.paymentMethod) && order.paymentStatus === 'Chờ thanh toán' && (
              <div className="flex flex-col items-center space-y-2">
                {order.expiredAt && (
                  <div className="text-sm text-gray-600 mb-2">
                    Thời gian thanh toán: <span className={`font-medium ${timeLeft ? 'text-red-600' : 'text-gray-600'}`}>{formatCountdown()}</span>
                  </div>
                )}
                <button 
                  onClick={() => handlePayAgain(order.paymentMethod)}
                  disabled={!timeLeft}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-md transition-colors flex items-center justify-center ${!timeLeft ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  {timeLeft ? 'Thanh toán ngay' : 'Hết thời gian thanh toán'}
                </button>
              </div>
            )}

            {/* Nút huỷ đơn hàng cho trạng thái 'Đang xử lý' (Chờ xác nhận) */}
            {order.status === "Đang xử lý" && (
              <button 
                onClick={handleCancelOrder}
                disabled={updating}
                className={`px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ${updating ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {updating ? (
                  <>
                    <span className="inline-block mr-2 align-middle h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    Đang huỷ...
                  </>
                ) : (
                  "Huỷ đơn hàng"
                )}
              </button>
            )}

            {order.status === "Chưa thanh toán" && (
              <button 
                onClick={handleOrderReceived}
                disabled={updating}
                className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${
                  updating ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {updating ? (
                  <>
                    <span className="inline-block mr-2 align-middle h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    Đang xử lý...
                  </>
                ) : (
                  "Đã nhận được hàng"
                )}
              </button>
            )}

            {order.status === "pending" && (
              <button className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                Hủy đơn hàng
              </button>
            )}

            <Link to="https://zalo.me/0366523313" target="_blank" className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors">
              Liên hệ hỗ trợ
            </Link >

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
