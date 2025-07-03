import { useState, useEffect } from 'react';
import axios from 'axios';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [sizeInput, setSizeInput] = useState('');
  const [sizeCategory, setSizeCategory] = useState(null);
  const [isAddingSize, setIsAddingSize] = useState(false);
  const [sizeError, setSizeError] = useState(null);
  const [sizesOfCategory, setSizesOfCategory] = useState([]);
  const [editingSizeId, setEditingSizeId] = useState(null);
  const [editingSizeName, setEditingSizeName] = useState('');
  const [isUpdatingSize, setIsUpdatingSize] = useState(false);
  const [isDeletingSize, setIsDeletingSize] = useState(false);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/categories');
      setCategories(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách danh mục. Vui lòng thử lại sau.');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        // Update category
        await axios.put(`http://localhost:8080/api/categories/${editingCategory.id}`, {
          name: categoryName.trim()
        });
      } else {
        // Create new category
        await axios.post('http://localhost:8080/api/categories', {
          name: categoryName.trim()
        });
      }
      
      // Refresh list and reset form
      fetchCategories();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Không thể lưu danh mục. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;

    try {
      await axios.delete(`http://localhost:8080/api/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Không thể xóa danh mục. Vui lòng thử lại.');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setCategoryName('');
  };

  // Thêm size cho category
  const fetchSizesOfCategory = async (categoryName) => {
    try {
      const res = await axios.get('http://localhost:8080/api/sizes');
      setSizesOfCategory(res.data.filter(size => size.catesize === categoryName));
    } catch (err) {
      setSizesOfCategory([]);
    }
  };

  const handleOpenSizeModal = (category) => {
    setSizeCategory(category);
    setSizeInput('');
    setShowSizeModal(true);
    setSizeError(null);
    fetchSizesOfCategory(category.name);
  };

  const handleCloseSizeModal = () => {
    setShowSizeModal(false);
    setSizeCategory(null);
    setSizeInput('');
    setSizeError(null);
  };

  const handleAddSizes = async (e) => {
    e.preventDefault();
    if (!sizeInput.trim()) return;
    const sizeNames = sizeInput.split('\n').map(s => s.trim()).filter(Boolean);
    if (sizeNames.length === 0) return;
    setIsAddingSize(true);
    setSizeError(null);
    try {
      await Promise.all(sizeNames.map(name =>
        axios.post('http://localhost:8080/api/sizes', {
          name,
          catesize: sizeCategory.name
        })
      ));
      setSizeInput('');
      fetchSizesOfCategory(sizeCategory.name);
      alert('Thêm size thành công!');
    } catch (err) {
      setSizeError('Không thể thêm size. Vui lòng thử lại.');
      console.error('Error adding size:', err);
    } finally {
      setIsAddingSize(false);
    }
  };

  const handleEditSize = (size) => {
    setEditingSizeId(size.id);
    setEditingSizeName(size.name);
  };

  const handleCancelEditSize = () => {
    setEditingSizeId(null);
    setEditingSizeName('');
  };

  const handleUpdateSize = async (size) => {
    if (!editingSizeName.trim()) return;
    setIsUpdatingSize(true);
    try {
      await axios.put(`http://localhost:8080/api/sizes/${size.id}`, {
        name: editingSizeName.trim(),
        catesize: size.catesize
      });
      setEditingSizeId(null);
      setEditingSizeName('');
      fetchSizesOfCategory(sizeCategory.name);
    } catch (err) {
      alert('Không thể cập nhật size.');
    } finally {
      setIsUpdatingSize(false);
    }
  };

  const handleDeleteSize = async (size) => {
    if (!window.confirm('Bạn có chắc muốn xoá size này?')) return;
    setIsDeletingSize(true);
    try {
      await axios.delete(`http://localhost:8080/api/sizes/${size.id}`);
      fetchSizesOfCategory(sizeCategory.name);
    } catch (err) {
      alert('Không thể xoá size.');
    } finally {
      setIsDeletingSize(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-700">Quản lý danh mục</h1>
            <p className="text-gray-600 mt-2">Tổng số danh mục: {categories.length}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-purple-700 transition-all duration-300 font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm danh mục
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Tên danh mục</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-purple-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{category.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900 mr-4 font-semibold transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Sửa
                      </button>
                      <button
                        onClick={() => handleOpenSizeModal(category)}
                        className="text-green-600 hover:text-green-900 mr-4 font-semibold transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Thêm size
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900 font-semibold transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Add/Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Tên danh mục
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="Nhập tên danh mục..."
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300"
                  >
                    {isSubmitting ? 'Đang lưu...' : (editingCategory ? 'Cập nhật' : 'Thêm mới')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showSizeModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-green-700">
                Thêm size cho danh mục: <span className="text-purple-700">{sizeCategory?.name}</span>
              </h2>
              <form onSubmit={handleAddSizes}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nhập tên size (mỗi dòng 1 size)
                  </label>
                  <textarea
                    value={sizeInput}
                    onChange={e => setSizeInput(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500 min-h-[100px]"
                    placeholder={"VD:\nS\nM\nL\nXL"}
                    required
                  />
                </div>
                {sizeError && <div className="mb-2 text-red-600 text-sm">{sizeError}</div>}
                {sizesOfCategory.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Các size hiện có:</label>
                    <ul className="divide-y divide-gray-200 bg-gray-50 rounded-lg border border-gray-200">
                      {sizesOfCategory.map(size => (
                        <li key={size.id} className="flex items-center px-3 py-2">
                          {editingSizeId === size.id ? (
                            <>
                              <input
                                value={editingSizeName}
                                onChange={e => setEditingSizeName(e.target.value)}
                                className="border px-2 py-1 rounded mr-2 w-24"
                                disabled={isUpdatingSize}
                              />
                              <button
                                onClick={() => handleUpdateSize(size)}
                                className="text-green-600 hover:text-green-900 font-semibold mr-2"
                                disabled={isUpdatingSize}
                              >Lưu</button>
                              <button
                                onClick={handleCancelEditSize}
                                className="text-gray-500 hover:text-gray-800 font-semibold"
                                disabled={isUpdatingSize}
                              >Huỷ</button>
                            </>
                          ) : (
                            <>
                              <span className="w-24 inline-block font-medium text-gray-700">{size.name}</span>
                              <button
                                onClick={() => handleEditSize(size)}
                                className="text-blue-600 hover:text-blue-900 font-semibold mr-2 ml-2"
                                disabled={isUpdatingSize || isDeletingSize}
                              >Sửa</button>
                              <button
                                onClick={() => handleDeleteSize(size)}
                                className="text-red-600 hover:text-red-900 font-semibold"
                                disabled={isUpdatingSize || isDeletingSize}
                              >Xoá</button>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseSizeModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingSize}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300"
                  >
                    {isAddingSize ? 'Đang thêm...' : 'Thêm size'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
