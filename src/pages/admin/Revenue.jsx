import { useState, useEffect } from 'react';

const Revenue = () => {
  const [revenueData, setRevenueData] = useState({
    daily: [],
    monthly: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('daily');

  // Giả lập dữ liệu doanh thu
  useEffect(() => {
    const mockDailyData = [
      { date: '2024-03-15', revenue: 1500000 },
      { date: '2024-03-14', revenue: 2300000 },
      { date: '2024-03-13', revenue: 950000 },
      { date: '2024-03-12', revenue: 1800000 },
      { date: '2024-03-11', revenue: 2100000 },
    ];

    const mockMonthlyData = [
      { month: '2024-03', revenue: 8650000 },
      { month: '2024-02', revenue: 12500000 },
      { month: '2024-01', revenue: 9800000 },
    ];

    setRevenueData({
      daily: mockDailyData,
      monthly: mockMonthlyData,
      total: 30950000,
    });
    setLoading(false);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Báo cáo doanh thu</h1>
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded ${
              timeRange === 'daily'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setTimeRange('daily')}
          >
            Theo ngày
          </button>
          <button
            className={`px-4 py-2 rounded ${
              timeRange === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setTimeRange('monthly')}
          >
            Theo tháng
          </button>
        </div>
      </div>

      {/* Tổng doanh thu */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Tổng doanh thu</h2>
        <p className="text-3xl font-bold text-blue-600">
          {formatCurrency(revenueData.total)}
        </p>
      </div>

      {/* Bảng doanh thu */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {timeRange === 'daily' ? 'Ngày' : 'Tháng'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doanh thu
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(timeRange === 'daily' ? revenueData.daily : revenueData.monthly).map(
              (item) => (
                <tr key={timeRange === 'daily' ? item.date : item.month}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {timeRange === 'daily' ? item.date : item.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.revenue)}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Có thể thêm biểu đồ ở đây */}
    </div>
  );
};

export default Revenue; 