import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiMail, FiPhone, FiUser, FiShield } from 'react-icons/fi';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập API call để lấy thông tin chi tiết user
    const fetchUserDetail = async () => {
      // Trong thực tế, đây sẽ là API call
      const mockUser = {
        id: parseInt(id),
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '0123456789',
        role: 'Admin',
        status: 'Hoạt động',
        createdAt: '2024-01-01',
        lastLogin: '2024-03-15 14:30',
        address: '123 Đường ABC, Quận XYZ, TP.HCM',
        department: 'Phòng Kỹ thuật',
        permissions: ['Quản lý người dùng', 'Xem báo cáo', 'Cấu hình hệ thống'],
      };

      setUser(mockUser);
      setLoading(false);
    };

    fetchUserDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/users')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <FiArrowLeft className="mr-2" />
          Quay lại
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 mt-1">ID: #{user.id}</p>
            </div>
           
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FiMail className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FiPhone className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="text-gray-900">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FiUser className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500">Phòng ban</p>
                  <p className="text-gray-900">{user.department}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FiShield className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500">Vai trò</p>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Địa chỉ</p>
                <p className="text-gray-900">{user.address}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Trạng thái</p>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.status === 'Hoạt động' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Ngày tạo</p>
                <p className="text-gray-900">{user.createdAt}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Đăng nhập cuối</p>
                <p className="text-gray-900">{user.lastLogin}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quyền hạn</h2>
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((permission, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail; 