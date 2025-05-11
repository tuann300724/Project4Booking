import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/orders');
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
        // Lấy tất cả userId duy nhất từ đơn hàng
        const userIds = [...new Set(data.map(order => order.userId))];
        // Gọi API lấy thông tin user cho từng userId
        const userMap = {};
        await Promise.all(userIds.map(async (id) => {
          try {
            const resUser = await fetch(`http://localhost:8080/api/users/${id}`);
            if (resUser.ok) {
              const userData = await resUser.json();
              userMap[id] = userData;
            }
          } catch {}
        }));
        setUsers(userMap);
      } catch (err) {
        setOrders([]);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-center text-purple-700">Quản lý đơn hàng</h1>
          <div className="overflow-x-auto">
            <table className="w-full text-left border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-purple-50">
                  <th className="py-3 px-3 font-semibold">Mã đơn</th>
                  <th className="py-3 px-3 font-semibold">Khách hàng</th>
                  <th className="py-3 px-3 font-semibold">Ngày đặt</th>
                  <th className="py-3 px-3 font-semibold">Tổng tiền</th>
                  <th className="py-3 px-3 font-semibold">Trạng thái</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-t hover:bg-purple-50 transition">
                    <td className="py-2 px-3 font-medium">#{order.id}</td>
                    <td className="py-2 px-3">
                      {users[order.userId]?.fullName || users[order.userId]?.name || `User #${order.userId}`}
                    </td>
                    <td className="py-2 px-3">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</td>
                    <td className="py-2 px-3 text-purple-600 font-semibold">{formatCurrency(order.total)}</td>
                    <td className="py-2 px-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <Link
                        to={`/admin/orders/${order.id}`}
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
        </div>
      </div>
    </div>
  );
};

export default Orders;