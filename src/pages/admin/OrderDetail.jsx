import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
    
    const paymentMethod = order.paymentStatus === 'Thanh toán khi nhận hàng' ? 'cash' : 'momo';
    
    try {
      setUpdating(true);
      const response = await fetch(`http://localhost:8080/api/orders/${id}/confirm?paymentMethod=${paymentMethod}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh order data
        const updatedOrder = await response.json();
        setOrder(updatedOrder);
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
                  <span className="text-gray-700">{order.paymentStatus}</span>
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