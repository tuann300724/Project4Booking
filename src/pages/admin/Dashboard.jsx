import { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });

  // Giả lập dữ liệu thống kê
  useEffect(() => {
    setStats({
      totalOrders: 150,
      totalProducts: 45,
      totalUsers: 1200,
      totalRevenue: 15000000,
    });
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Thống kê đơn hàng */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              📦
            </div>
            <div className="ml-4">
              <p className="text-gray-500">Tổng đơn hàng</p>
              <p className="text-2xl font-semibold">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        {/* Thống kê sản phẩm */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              🛍️
            </div>
            <div className="ml-4">
              <p className="text-gray-500">Tổng sản phẩm</p>
              <p className="text-2xl font-semibold">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        {/* Thống kê người dùng */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              👥
            </div>
            <div className="ml-4">
              <p className="text-gray-500">Tổng người dùng</p>
              <p className="text-2xl font-semibold">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        {/* Thống kê doanh thu */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              💰
            </div>
            <div className="ml-4">
              <p className="text-gray-500">Tổng doanh thu</p>
              <p className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Biểu đồ và bảng thống kê có thể thêm vào đây */}
    </div>
  );
};

export default Dashboard; 