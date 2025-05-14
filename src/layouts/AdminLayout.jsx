import { Outlet, Link } from 'react-router-dom';
import { useState } from 'react';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/orders', label: 'Đơn hàng', icon: '📦' },
    { path: '/admin/products', label: 'Sản phẩm', icon: '🛍️' },
    { path: '/admin/discounts', label: 'Mã giảm giá', icon: '🏷️' },
    { path: '/admin/users', label: 'Người dùng', icon: '👥' },
    { path: '/admin/revenue', label: 'Doanh thu', icon: '💰' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-r from-purple-100 to-blue-100">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className={`text-2xl font-bold text-purple-700 transition-all duration-300 ${!isSidebarOpen && 'hidden'}`}>Admin Panel</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 hover:text-purple-700 ml-2"
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-100 rounded-lg mx-2 my-1 transition"
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-purple-700">Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Xin chào, Admin!</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-white to-purple-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 