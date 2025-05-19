import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchOrderAndUser = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/orders/${id}`);
        if (res.ok) {
          const orderData = await res.json();
          setOrder(orderData);
          // Lấy thông tin user
          if (orderData.userId) {
            const resUser = await fetch(`http://localhost:8080/api/users/${orderData.userId}`);
            if (resUser.ok) {
              const userData = await resUser.json();
              setUser(userData);
            }
          }
        }
      } catch {}
      setLoading(false);
    };
    fetchOrderAndUser();
  }, [id]);

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

  const formatCountdown = () => {
    if (!timeLeft) return 'Hết thời gian thanh toán';
    return `${timeLeft.hours.toString().padStart(2, '0')}:${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`;
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

  const getStatusIcon = (icon) => {
    switch (icon) {
      case 'clock':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'check-circle':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'cash':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'x-circle':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'credit-card':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đang xử lý':
        return 'bg-yellow-100 text-yellow-800';
      case 'Xác nhận':
        return 'bg-green-100 text-green-800';
      case 'Đang giao hàng':
        return 'bg-purple-100 text-purple-800';
      case 'Hoàn thành':
        return 'bg-green-100 text-green-800';
      case 'Đã hủy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    return status; // Since we're now using Vietnamese status directly
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUpdateStatus = async () => {
    if (!order) return;
    
    const paymentMethods = order.paymentMethod;
    console.log(paymentMethods);
    try {
      setUpdating(true);
      const response = await fetch(`http://localhost:8080/api/orders/${id}/confirm?paymentMethod=${paymentMethods}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Cập nhật trạng thái ngay lập tức
        setOrder(prevOrder => ({
          ...prevOrder,
          status: 'Xác nhận',
          paymentStatus: 'Đã thanh toán',
          updatedAt: new Date().toISOString()
        }));

        // Fetch lại dữ liệu mới nhất
        const updatedOrderRes = await fetch(`http://localhost:8080/api/orders/${id}`);
        if (updatedOrderRes.ok) {
          const updatedOrderData = await updatedOrderRes.json();
          setOrder(updatedOrderData);
        }

        alert('Cập nhật trạng thái thành công!');
      } else {
        alert('Có lỗi xảy ra khi cập nhật trạng thái!');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái!');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Không tìm thấy đơn hàng!</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-purple-700">Chi tiết đơn hàng #{order.id}</h1>
          <button
            onClick={() => navigate('/admin/orders')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Quay lại
          </button>
        </div>

        {/* Thông tin đơn hàng */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Thông tin người nhận</h2>
              <div className="space-y-3">
                <p className="flex items-center">
                  <span className="font-medium w-32">Tên:</span>
                  <span className="text-gray-700">{order.receiverName}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium w-32">Email:</span>
                  <span className="text-gray-700">{order.receiverEmail}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium w-32">Điện thoại:</span>
                  <span className="text-gray-700">{order.receiverPhone}</span>
                </p>
                <p className="flex items-start">
                  <span className="font-medium w-32">Địa chỉ:</span>
                  <span className="text-gray-700">{order.receiverAddress}</span>
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>
              <div className="space-y-3">
                <p className="flex items-center">
                  <span className="font-medium w-32">Ngày đặt:</span>
                  <span className="text-gray-700">{formatDate(order.createdAt)}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium w-32">Cập nhật:</span>
                  <span className="text-gray-700">{formatDate(order.updatedAt)}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium w-32">Trạng thái:</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium w-32">Thanh toán:</span>
                  <div className="flex flex-col gap-2">
                    <span className={`flex items-center px-3 py-1 rounded-full text-sm ${getPaymentStatusInfo(order.paymentStatus).color}`}>
                      {getStatusIcon(getPaymentStatusInfo(order.paymentStatus).icon)}
                      <span className="ml-1">{getPaymentStatusInfo(order.paymentStatus).text}</span>
                    </span>
                    <span className={`flex items-center px-3 py-1 rounded-full text-sm ${getPaymentMethodInfo(order.paymentMethod).color}`}>
                      {getStatusIcon(getPaymentMethodInfo(order.paymentMethod).icon)}
                      <span className="ml-1">{getPaymentMethodInfo(order.paymentMethod).text}</span>
                    </span>
                    {order.paymentMethod === 'vnpay' && order.expiredAt && order.paymentStatus === 'Chờ thanh toán' && (
                      <div className="text-sm text-gray-600">
                        Thời gian thanh toán: <span className={`font-medium ${timeLeft ? 'text-red-600' : 'text-gray-600'}`}>
                          {formatCountdown()}
                        </span>
                      </div>
                    )}
                  </div>
                </p>
                <p className="flex items-center">
                  <span className="font-medium w-32">Tổng tiền:</span>
                  <span className="text-purple-600 font-semibold">{formatCurrency(order.total)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm đã đặt</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(order.orderItems || []).map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Sản phẩm #{item.productId}</div>
                      <div className="text-sm text-gray-500">Size #{item.sizeId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(item.price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-purple-600">{formatCurrency(item.price * item.quantity)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cập nhật trạng thái */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
          {order?.status === 'Đang xử lý' && (
            <button
              onClick={handleUpdateStatus}
              disabled={updating}
              className={`px-6 py-2 rounded-lg transition-colors ${
                updating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {updating ? 'Đang cập nhật...' : 'Xác nhận đơn hàng'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;