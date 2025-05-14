import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchCode, setSearchCode] = useState('');
  const [searching, setSearching] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchCode.trim()) {
      fetchOrders();
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`http://localhost:8080/api/orders/code/${searchCode}`);
      if (res.ok) {
        const order = await res.json();
        setOrders([order]);
        // Fetch user info for the order
        if (order.userId) {
          const resUser = await fetch(`http://localhost:8080/api/users/${order.userId}`);
          if (resUser.ok) {
            const userData = await resUser.json();
            setUsers({ [order.userId]: userData });
          }
        }
      } else {
        setOrders([]);
      }
    } catch (err) {
      setOrders([]);
    }
    setSearching(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
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
    switch (status) {
      case 'pending':
        return 'Đang xử lý';
      case 'confirmed':
        return 'Xác nhận';
      case 'in_delivery':
        return 'Đang giao hàng';
      case 'completed':
      case 'success':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-center text-purple-700">Quản lý đơn hàng</h1>
          
          {/* Search Form */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Nhập mã đơn hàng..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={searching}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  searching
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {searching ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>
              {searchCode && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchCode('');
                    fetchOrders();
                  }}
                  className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Xóa
                </button>
              )}
            </form>
          </div>

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
                {currentItems.map(order => (
                  <tr key={order.id} className="border-t hover:bg-purple-50 transition">
                    <td className="py-2 px-3 font-medium">#{order.orderCode}</td>
                    <td className="py-2 px-3">
                      {order.receiverName || 'Khách hàng'}
                    </td>
                    <td className="py-2 px-3">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</td>
                    <td className="py-2 px-3 text-purple-600 font-semibold">{formatCurrency(order.total)}</td>
                    <td className="py-2 px-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                      currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Trang trước
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                      currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Trang sau
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Hiển thị <span className="font-medium">{indexOfFirstItem + 1}</span> đến{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, orders.length)}
                      </span>{' '}
                      của <span className="font-medium">{orders.length}</span> kết quả
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                          currentPage === 1 ? 'cursor-not-allowed' : ''
                        }`}
                      >
                        <span className="sr-only">Trang trước</span>
                        &laquo;
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => handlePageChange(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === index + 1
                              ? 'z-10 bg-purple-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                          currentPage === totalPages ? 'cursor-not-allowed' : ''
                        }`}
                      >
                        <span className="sr-only">Trang sau</span>
                        &raquo;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;