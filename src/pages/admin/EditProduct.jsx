import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    productSizes: [],
    discount: {
      code: '',
      discountType: 'percentage',
      discountValue: '',
      startDate: '',
      endDate: ''
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch product data
        const productResponse = await axios.get(`http://localhost:8080/api/products/${id}`);
        const product = productResponse.data;
        
        // Fetch categories
        const categoriesResponse = await axios.get('http://localhost:8080/api/categories');
        setCategories(categoriesResponse.data);

        // Fetch sizes
        const sizesResponse = await axios.get('http://localhost:8080/api/sizes');
        setSizes(sizesResponse.data);

        // Set images - productImages is already an array of image objects
        if (product.productImages && Array.isArray(product.productImages)) {
          setImages(product.productImages);
        }

        // Set form data
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId: product.category.id,
          productSizes: product.productSizes.map(ps => ({
            sizeId: ps.id.sizeId,
            stock: ps.stock
          })),
          discount: product.discount || {
            code: '',
            discountType: 'percentage',
            discountValue: '',
            startDate: '',
            endDate: ''
          }
        });
      } catch (err) {
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSizeChange = (sizeId, value) => {
    setFormData(prev => ({
      ...prev,
      productSizes: prev.productSizes.map(ps => 
        ps.sizeId === sizeId ? { ...ps, stock: parseInt(value) || 0 } : ps
      )
    }));
  };

  const handleDiscountChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      discount: {
        ...prev.discount,
        [name]: value
      }
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post(
        `http://localhost:8080/api/products/${id}/upload-images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
          validateStatus: function (status) {
            return status >= 200 && status < 300;
          }
        }
      );

      if (response.data && Array.isArray(response.data)) {
        // Add new images to the existing ones
        setImages(prev => [...prev, ...response.data]);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      let errorMessage = 'Không thể tải lên hình ảnh. ';
      
      if (err.code === 'ERR_NETWORK') {
        errorMessage += 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
      } else if (err.response) {
        errorMessage += `Lỗi từ máy chủ: ${err.response.data?.message || err.response.statusText}`;
      } else if (err.request) {
        errorMessage += 'Không nhận được phản hồi từ máy chủ.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      console.error('Error uploading images:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/products/${id}/images/${imageId}`,
        {
          validateStatus: function (status) {
            return status >= 200 && status < 300;
          }
        }
      );

      if (response.status === 200 || response.status === 204) {
        setImages(prev => prev.filter(img => img.id !== imageId));
      } else {
        throw new Error('Failed to delete image');
      }
    } catch (err) {
      let errorMessage = 'Không thể xóa hình ảnh. ';
      
      if (err.code === 'ERR_NETWORK') {
        errorMessage += 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
      } else if (err.response) {
        errorMessage += `Lỗi từ máy chủ: ${err.response.data?.message || err.response.statusText}`;
      } else if (err.request) {
        errorMessage += 'Không nhận được phản hồi từ máy chủ.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      console.error('Error deleting image:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Add basic product information
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());

      // Add category ID
      formDataToSend.append('categoryId', formData.categoryId);

      // Add product sizes if any
      if (formData.productSizes && formData.productSizes.length > 0) {
        formData.productSizes.forEach((size, index) => {
          formDataToSend.append(`productSizes[${index}].sizeId`, size.sizeId);
          formDataToSend.append(`productSizes[${index}].stock`, size.stock);
        });
      }

      // Add discount information if exists
      if (formData.discount) {
        if (formData.discount.code) formDataToSend.append('discount.code', formData.discount.code);
        if (formData.discount.discountValue) formDataToSend.append('discount.discountValue', formData.discount.discountValue);
        if (formData.discount.startDate) formDataToSend.append('discount.startDate', formData.discount.startDate);
        if (formData.discount.endDate) formDataToSend.append('discount.endDate', formData.discount.endDate);
      }

      // Add any new images
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput && fileInput.files.length > 0) {
        Array.from(fileInput.files).forEach(file => {
          formDataToSend.append('images', file);
        });
      }

      const response = await axios.put(
        `http://localhost:8080/api/products/${id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
          validateStatus: function (status) {
            return status >= 200 && status < 300;
          }
        }
      );

      if (response.data) {
        // Update local state with the response data
        setImages(response.data.productImages || []);
        navigate('/admin/products');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      let errorMessage = 'Không thể cập nhật sản phẩm. ';
      
      if (err.code === 'ERR_NETWORK') {
        errorMessage += 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
      } else if (err.response) {
        errorMessage += `Lỗi từ máy chủ: ${err.response.data?.message || err.response.statusText}`;
      } else if (err.request) {
        errorMessage += 'Không nhận được phản hồi từ máy chủ.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      console.error('Error updating product:', err);
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg shadow-lg max-w-md">
          <div className="text-red-600 text-center">
            <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-lg font-semibold">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-700">Chỉnh sửa sản phẩm</h1>
          <button
            onClick={() => navigate('/admin/products')}
            className="text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh sản phẩm</label>
                <div className="mt-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={`http://localhost:8080${image.imageUrl}`}
                          alt={`Product ${image.id}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(image.id)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <label className="relative flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors duration-200">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
                      ) : (
                        <div className="text-center">
                          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="mt-1 block text-sm text-gray-500">Thêm ảnh</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sizes and Stock */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Kích thước và số lượng</h3>
              <div className="space-y-3">
                {sizes.map(size => (
                  <div key={size.id} className="flex items-center gap-4">
                    <label className="w-24 text-sm font-medium text-gray-700">{size.name}</label>
                    <input
                      type="number"
                      value={formData.productSizes.find(ps => ps.sizeId === size.id)?.stock || 0}
                      onChange={(e) => handleSizeChange(size.id, e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      min="0"
                    />
                  </div>
                ))}
              </div>

              {/* Discount Information */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khuyến mãi</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã khuyến mãi</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.discount.code}
                      onChange={handleDiscountChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị khuyến mãi (%)</label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discount.discountValue}
                      onChange={handleDiscountChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.discount.startDate}
                        onChange={handleDiscountChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.discount.endDate}
                        onChange={handleDiscountChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct; 