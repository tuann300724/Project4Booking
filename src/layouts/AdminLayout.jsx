import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/orders', label: 'Đơn hàng', icon: '📦' },
    { path: '/admin/products', label: 'Sản phẩm', icon: '🛍️' },
    { path: '/admin/categories', label: 'Danh mục', icon: '📑' },
    { path: '/admin/discounts', label: 'Mã giảm giá', icon: '🏷️' },
    { path: '/admin/prizes', label: 'Vòng quay', icon: '🎡' },
    { path: '/admin/users', label: 'Người dùng', icon: '👥' },
    { path: '/admin/revenue', label: 'Doanh thu', icon: '💰' },
    { path: '/admin/chat', label: 'Chat', icon: '💬' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-purple-100 to-blue-100">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <Link to="/admin" className="text-2xl font-bold text-purple-700">Admin Panel</Link>
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
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-medium">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* <span className="font-medium">{user?.username}</span> */}
                <FiChevronDown className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link
                    to="/user/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Tài khoản
                  </Link>
                  <Link
                    to="/user/vouchers"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Mã giảm giá của tôi
                  </Link>
                  
                  <Link
                    to="/user/orders"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Đơn hàng của tôi
                  </Link>
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Quản trị
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
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