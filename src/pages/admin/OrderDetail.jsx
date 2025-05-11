import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'in_delivery':
        return 'Đang giao hàng';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
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
              <h2 className="text-lg font-semibold mb-4">Thông tin khách hàng</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Tên:</span> {user?.fullName || user?.name || '---'}</p>
                <p><span className="font-medium">Email:</span> {user?.email || '---'}</p>
                <p><span className="font-medium">Điện thoại:</span> {user?.phone || '---'}</p>
                <p><span className="font-medium">Địa chỉ:</span> {user?.address || order.address || '---'}</p>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Ngày đặt:</span> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</p>
                <p>
                  <span className="font-medium">Trạng thái:</span>{' '}
                  <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </p>
                <p><span className="font-medium">Tổng tiền:</span> {formatCurrency(order.total)}</p>
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
                {(order.items || order.orderItems || []).map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name || `Sản phẩm #${item.productId}`}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(item.price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(item.total || (item.price * item.quantity))}</div>
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
          <button
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Cập nhật trạng thái
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;