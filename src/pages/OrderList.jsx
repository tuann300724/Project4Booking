import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const statusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'completed':
    case 'success':
      return 'bg-green-100 text-green-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/orders');
        if (!res.ok) throw new Error('Không thể lấy danh sách đơn hàng');
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Không thể tải danh sách đơn hàng!');
        setOrders([]);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-center text-purple-700">Tất cả đơn hàng</h1>
          {orders.length === 0 ? (
            <div className="text-center text-gray-500">Không có đơn hàng nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-purple-50">
                    <th className="py-3 px-3 font-semibold">Mã đơn</th>
                    <th className="py-3 px-3 font-semibold">Ngày đặt</th>
                    <th className="py-3 px-3 font-semibold">Trạng thái</th>
                    <th className="py-3 px-3 font-semibold">Tổng tiền</th>
                    <th className="py-3 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr
                      key={order.id}
                      className="border-t hover:bg-purple-50 transition"
                    >
                      <td className="py-2 px-3 font-medium">#{order.id}</td>
                      <td className="py-2 px-3">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</td>
                      <td className="py-2 px-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-purple-600 font-semibold">{order.total?.toLocaleString('vi-VN')}đ</td>
                      <td className="py-2 px-3">
                        <Link
                          to={`/orderslist/${order.id}`}
                          className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                        >
                          Xem chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderList;