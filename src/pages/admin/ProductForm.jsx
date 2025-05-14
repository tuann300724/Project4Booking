import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiX, FiUpload } from 'react-icons/fi';
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
    sizes: [
      { size: 'S', quantity: 0 },
      { size: 'M', quantity: 0 },
      { size: 'L', quantity: 0 },
      { size: 'XL', quantity: 0 }
    ]
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lưu trữ object URLs để cleanup
  const [objectUrls, setObjectUrls] = useState([]);
  const [toBeRevoked, setToBeRevoked] = useState([]);

  useEffect(() => {
    // Lấy categories từ API
    axios.get('http://localhost:8080/api/categories')
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: 'Áo thun nam',
        category: '1', // Giả lập id
        price: '250000',
        description: 'Áo thun nam chất liệu cotton',
        images: [
          { url: 'https://placehold.co/400x400', file: null },
          { url: 'https://placehold.co/400x400', file: null }
        ],
        status: 'in_stock',
        sizes: [
          { size: 'S', quantity: 10 },
          { size: 'M', quantity: 15 },
          { size: 'L', quantity: 20 },
          { size: 'XL', quantity: 5 }
        ]
      });
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
      // 1. Tạo product
      const productForm = new FormData();
      productForm.append('name', formData.name);
      productForm.append('description', formData.description);
      productForm.append('price', formData.price);
      productForm.append('categoryId', formData.category);
      formData.images.forEach(imgObj => {
        if (imgObj.file) productForm.append('images', imgObj.file);
      });
      // Gửi product
      const res = await axios.post('http://localhost:8080/api/products', productForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const productId = res.data.id;
      // 2. Gửi từng size
      const sizeIdMap = { S: 1, M: 2, L: 3, XL: 4 };
      for (const size of formData.sizes) {
        await axios.post('http://localhost:8080/api/product-sizes', {
          productId,
          sizeId: sizeIdMap[size.size],
          stock: size.quantity
        });
      }
      alert('Tạo sản phẩm thành công!');
      navigate('/admin/products');
    } catch (err) {
      alert('Lỗi tạo sản phẩm!');
    } finally {
      setLoading(false);
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá (VNĐ)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            ></textarea>
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

          <div>
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
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="in_stock">Còn hàng</option>
              <option value="out_of_stock">Hết hàng</option>
            </select>
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