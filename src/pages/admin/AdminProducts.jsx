import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Giả lập dữ liệu sản phẩm
  useEffect(() => {
    const mockProducts = [
      {
        id: 1,
        name: 'Sản phẩm A',
        category: 'Danh mục 1',
        price: 1500000,
        stock: 50,
        status: 'Còn hàng',
      },
      {
        id: 2,
        name: 'Sản phẩm B',
        category: 'Danh mục 2',
        price: 2300000,
        stock: 30,
        status: 'Còn hàng',
      },
      {
        id: 3,
        name: 'Sản phẩm C',
        category: 'Danh mục 1',
        price: 950000,
        stock: 0,
        status: 'Hết hàng',
      },
    ];

    setProducts(mockProducts);
    setLoading(false);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Còn hàng':
        return 'bg-green-100 text-green-800';
      case 'Hết hàng':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-purple-700">Quản lý sản phẩm</h1>
        <Link to="/admin/products/new" className="bg-purple-600 text-white px-6 py-2 rounded-lg shadow hover:bg-purple-700 transition font-semibold">
          + Thêm sản phẩm
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-purple-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Mã sản phẩm</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Tên sản phẩm</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Danh mục</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Giá</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Tồn kho</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-purple-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">#{product.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-700 font-bold">{formatCurrency(product.price)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.status)}`}>{product.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-blue-600 hover:text-blue-900 mr-3 font-semibold">Sửa</button>
                  <button className="text-red-600 hover:text-red-900 font-semibold">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts; 