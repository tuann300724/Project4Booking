import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [],
    monthlyRevenue: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsRes = await axios.get('http://localhost:8080/api/products');
        const products = productsRes.data;

        // Fetch users (excluding admin role)
        const usersRes = await axios.get('http://localhost:8080/api/users');
        const users = usersRes.data.filter(user => user.role.id !== 1);

        // Fetch orders
        const ordersRes = await axios.get('http://localhost:8080/api/orders');
        const orders = ordersRes.data;

        // Fetch payments
        const paymentsRes = await axios.get('http://localhost:8080/api/payments');
        const payments = paymentsRes.data;

        // Calculate total revenue
        const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

        // Get recent orders (last 5)
        const recentOrders = orders.slice(-5).map(order => ({
          id: order.id,
          customer: order.receiverName,
          amount: order.total,
          status: order.status,
          orderCode: order.orderCode
        }));

        // Calculate top products
        const productSales = {};
        orders.forEach(order => {
          order.orderItems.forEach(item => {
            if (!productSales[item.product.id]) {
              productSales[item.product.id] = {
                name: item.product.name,
                sales: 0,
                revenue: 0
              };
            }
            productSales[item.product.id].sales += item.quantity;
            productSales[item.product.id].revenue += item.price * item.quantity;
          });
        });

        const topProducts = Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 3);

        // Calculate monthly revenue
        const monthlyRevenue = orders.reduce((acc, order) => {
          const month = new Date(order.createdAt).getMonth() + 1;
          if (!acc[month]) {
            acc[month] = 0;
          }
          acc[month] += order.total;
          return acc;
        }, {});

        const monthlyRevenueArray = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
          month: `T${month}`,
          revenue
        }));

        setStats({
          totalOrders: orders.length,
          totalProducts: products.length,
          totalUsers: users.length,
          totalRevenue,
          recentOrders,
          topProducts,
          monthlyRevenue: monthlyRevenueArray
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const StatCard = ({ title, value, icon, trend, trendValue, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trend === 'up' ? (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
              <span>{trendValue}% so với tháng trước</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Báo cáo chi tiết
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng đơn hàng"
          value={stats.totalOrders}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          trend="up"
          trendValue="12"
          color="bg-blue-500"
        />
        <StatCard
          title="Tổng sản phẩm"
          value={stats.totalProducts}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          trend="up"
          trendValue="8"
          color="bg-green-500"
        />
        <StatCard
          title="Tổng người dùng"
          value={stats.totalUsers}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          trend="up"
          trendValue="15"
          color="bg-purple-500"
        />
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(stats.totalRevenue)}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend="up"
          trendValue="20"
          color="bg-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Đơn hàng gần đây */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Đơn hàng gần đây</h2>
          <div className="space-y-4">
            {stats.recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{order.customer}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(order.amount)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  order.status === 'Xác nhận' ? 'bg-green-100 text-green-800' :
                  order.status === 'Đang xử lý' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {order.status === 'Xác nhận' ? 'Hoàn thành' :
                   order.status === 'Đang xử lý' ? 'Đang chờ' :
                   'Đang xử lý'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sản phẩm bán chạy */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sản phẩm bán chạy</h2>
          <div className="space-y-4">
            {stats.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} đơn hàng</p>
                </div>
                <p className="font-semibold text-purple-600">{formatCurrency(product.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Biểu đồ doanh thu */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Doanh thu theo tháng</h2>
        <div className="h-64 flex items-end space-x-2">
          {stats.monthlyRevenue.map((item, index) => (
            <div key={index} className="flex-1">
              <div 
                className="bg-purple-500 rounded-t-lg hover:bg-purple-600 transition-colors duration-200"
                style={{ 
                  height: `${(item.revenue / Math.max(...stats.monthlyRevenue.map(m => m.revenue))) * 100}%`,
                  minHeight: '20px'
                }}
              />
              <p className="text-center text-sm text-gray-600 mt-2">{item.month}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 