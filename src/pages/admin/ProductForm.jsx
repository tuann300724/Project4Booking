import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiX, FiUpload, FiRefreshCw } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    category: '', // categoryId
    price: '',
    description: '',
    images: [], // [{ url, file }]
    status: 'in_stock',
    isFeatured: false,
    sizes: [
      { size: 'S', quantity: 0 },
      { size: 'M', quantity: 0 },
      { size: 'L', quantity: 0 },
      { size: 'XL', quantity: 0 }
    ]
  });
  const [formattedPrice, setFormattedPrice] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  // Lưu trữ object URLs để cleanup
  const [objectUrls, setObjectUrls] = useState([]);
  const [toBeRevoked, setToBeRevoked] = useState([]);

  const [allSizes, setAllSizes] = useState([]);

  useEffect(() => {
    // Lấy categories từ API
    axios.get('http://localhost:8080/api/categories')
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
    // Lấy allSizes từ API
    axios.get('http://localhost:8080/api/sizes')
      .then(res => setAllSizes(res.data))
      .catch(() => setAllSizes([]));
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const initialPrice = '250000';
      setFormData({
        name: 'Áo thun nam',
        category: '1', // Giả lập id
        price: initialPrice,
        description: 'Áo thun nam chất liệu cotton',
        images: [
          { url: 'https://placehold.co/400x400', file: null },
          { url: 'https://placehold.co/400x400', file: null }
        ],
        status: 'in_stock',
        isFeatured: false,
        sizes: [
          { size: 'S', quantity: 10 },
          { size: 'M', quantity: 15 },
          { size: 'L', quantity: 20 },
          { size: 'XL', quantity: 5 }
        ]
      });
      setFormattedPrice(formatCurrency(initialPrice));
    }
  }, [id]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [objectUrls]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'category') {
      const selectedCategory = categories.find(cat => cat.id == value);
      if (selectedCategory) {
        const filteredSizes = allSizes.filter(size => size.catesize === selectedCategory.name);
        setFormData(prev => ({
          ...prev,
          sizes: filteredSizes.map(size => ({ size: size.name, quantity: 0 }))
        }));
      }
    }
  };

  // Format currency value
  const formatCurrency = (value) => {
    if (!value) return '';
    
    // Remove any non-digit characters
    const numericValue = value.toString().replace(/\D/g, '');
    
    // Format with thousand separators
    return new Intl.NumberFormat('vi-VN').format(numericValue);
  };

  // Handle price input change
  const handlePriceChange = (e) => {
    const inputValue = e.target.value;
    
    // Remove formatted characters and get pure number
    const numericValue = inputValue.replace(/\D/g, '');
    
    // Update the actual price value in state
    setFormData(prev => ({
      ...prev,
      price: numericValue
    }));
    
    // Update the formatted display value
    setFormattedPrice(formatCurrency(numericValue));
  };

  const handleSizeQuantityChange = (size, value) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map(s => 
        s.size === size ? { ...s, quantity: parseInt(value) || 0 } : s
      )
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({ url: URL.createObjectURL(file), file }));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const img = prev.images[index];
      if (img.url && img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url);
      }
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      };
    });
  };

  // Kéo thả sắp xếp hình ảnh
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(formData.images);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setFormData(prev => ({
      ...prev,
      images: reordered
    }));
  };

  // Revoke các URL đã bị xóa sau khi render xong
  useEffect(() => {
    if (toBeRevoked.length > 0) {
      toBeRevoked.forEach(url => URL.revokeObjectURL(url));
      setToBeRevoked([]);
    }
  }, [formData.images]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Tạo product trước để lấy productId
      const productForm = new FormData();
      productForm.append('name', formData.name);
      productForm.append('description', formData.description);
      productForm.append('price', formData.price);
      productForm.append('categoryId', formData.category);
      productForm.append('isFeatured', formData.isFeatured);
      formData.images.forEach(imgObj => {
        if (imgObj.file) productForm.append('images', imgObj.file);
      });
      const res = await axios.post('http://localhost:8080/api/products', productForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const productId = res.data.id;

      // 2. Gửi từng size (lấy sizeId từ allSizes)
      const selectedCategory = categories.find(cat => cat.id == formData.category);
      const filteredSizes = allSizes.filter(size => size.catesize === selectedCategory.name);
      for (const size of formData.sizes) {
        if (size.quantity > 0) {
          const sizeObj = filteredSizes.find(s => s.name === size.size);
          if (sizeObj) {
            await axios.post('http://localhost:8080/api/product-sizes', {
              productId,
              sizeId: sizeObj.id,
              stock: size.quantity
            });
          }
        }
      }
      alert('Tạo sản phẩm thành công!');
      navigate('/admin/products');
    } catch (err) {
      alert('Lỗi tạo sản phẩm hoặc size!');
    } finally {
      setLoading(false);
    }
  };

  const generateDescription = async () => {
    // Kiểm tra xem có tên sản phẩm và hình ảnh chưa
    if (!formData.name) {
      alert('Vui lòng nhập tên sản phẩm trước khi tạo mô tả');
      return;
    }
    
    if (formData.images.length === 0 || !formData.images[0].file) {
      alert('Vui lòng tải lên ít nhất một hình ảnh để tạo mô tả');
      return;
    }
    
    try {
      setIsGeneratingDescription(true);
      
      // Tạo FormData để gửi lên API
      const descriptionForm = new FormData();
      descriptionForm.append('name', formData.name);
      descriptionForm.append('image', formData.images[0].file);
      
      // Gọi API để tạo mô tả
      const response = await axios.post(
        'http://localhost:8080/api/generate-detailed-description',
        descriptionForm,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      
      // Cập nhật mô tả trong form
      setFormData(prev => ({
        ...prev,
        description: response.data
      }));
      
    } catch (error) {
      console.error('Lỗi khi tạo mô tả:', error);
      alert('Không thể tạo mô tả tự động. Vui lòng thử lại sau hoặc nhập mô tả thủ công.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isEditMode ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên sản phẩm
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Size input ngay dưới danh mục */}
          {formData.category && formData.sizes.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng theo size
              </label>
              <div className="grid grid-cols-2 gap-4">
                {formData.sizes.map((size) => (
                  <div key={size.size} className="flex items-center space-x-2">
                    <span className="w-12 text-sm font-medium text-gray-700">{size.size}</span>
                    <input
                      type="number"
                      value={size.quantity}
                      onChange={(e) => handleSizeQuantityChange(size.size, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá (VNĐ)
            </label>
            <div className="relative">
              <input
                type="text"
                name="price"
                value={formattedPrice}
                onChange={handlePriceChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                đ
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Mô tả
              </label>
              <button
                type="button"
                onClick={generateDescription}
                disabled={isGeneratingDescription || !formData.name || formData.images.length === 0}
                className={`flex items-center text-sm px-3 py-1 rounded ${
                  isGeneratingDescription || !formData.name || formData.images.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isGeneratingDescription ? (
                  <>
                    <FiRefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <FiRefreshCw className="w-4 h-4 mr-1" />
                    Tạo mô tả AI
                  </>
                )}
              </button>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            ></textarea>
            <p className="mt-1 text-sm text-gray-500">
              {formData.name && formData.images.length > 0 ? 
                'Nhấn "Tạo mô tả AI" để tạo mô tả tự động từ tên và hình ảnh sản phẩm' : 
                'Nhập tên sản phẩm và tải ảnh lên để sử dụng tính năng tạo mô tả tự động'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh
            </label>
            <div className="mt-2">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click để tải lên</span> hoặc kéo thả
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
            {formData.images.length > 0 && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="images" direction="horizontal">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      {formData.images.map((imageObj, index) => (
                        <Draggable key={imageObj.url} draggableId={imageObj.url} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`relative group ${index === 0 ? 'col-span-2 row-span-2' : ''}`}
                            >
                              <img
                                src={imageObj.url}
                                alt={`Product ${index + 1}`}
                                className={`w-full object-cover rounded-lg ${index === 0 ? 'h-48' : 'h-32'}`}
                                style={{ background: '#eee' }}
                                onError={e => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://placehold.co/400x400?text=No+Image';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                              <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                {index === 0 ? 'Ảnh bìa' : `Vị trí ${index + 1}`}
                              </div>
                              {index === 0 && (
                                <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                                  Ảnh chính
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
              Sản phẩm nổi bật
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {isEditMode ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;