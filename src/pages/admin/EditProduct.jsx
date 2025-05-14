import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FiX, FiUpload } from 'react-icons/fi';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [images, setImages] = useState([]); // [{id, url, file, imageUrl}]
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    productSizes: [],
  });

  // Debug: log images array whenever it changes
  useEffect(() => {
    console.log('Current images array:', images);
  }, [images]);

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
        const allSizes = sizesResponse.data;
        setSizes(allSizes);
        // Fetch productSizes (stock theo size) từ API riêng
        const productSizesRes = await axios.get(`http://localhost:8080/api/product-sizes/product/${id}`);
        const productSizesFromApi = productSizesRes.data; // [{sizeId, stock}]
        // Map đủ các size, nếu thiếu thì stock = 0
        const productSizes = allSizes.map(size => {
          const found = productSizesFromApi.find(ps => ps.sizeId === size.id);
          return found ? { sizeId: size.id, stock: found.stock } : { sizeId: size.id, stock: 0 };
        });
        // Set images - productImages is already an array of image objects
        if (product.productImages && Array.isArray(product.productImages)) {
          setImages(product.productImages.map(img => ({
            id: img.id,
            url: `http://localhost:8080${img.imageUrl}`,
            file: null,
            imageUrl: img.imageUrl
          })));
        }
        // Set form data
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId: product.category.id,
          productSizes,
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
        ps.sizeId === sizeId
          ? { ...ps, stock: value === '' ? 0 : parseInt(value) || 0 }
          : ps
      )
    }));
  };

  // Upload nhiều hình, thêm vào images state
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: `new-${file.name}-${Date.now()}`,
      url: URL.createObjectURL(file),
      file,
      imageUrl: null
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  // Xóa hình khỏi images state
  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Kéo thả sắp xếp hình ảnh
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(images);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setImages(reordered);
  };

  // Xử lý submit: upload hình mới, gửi thông tin sản phẩm, cập nhật thứ tự hình ảnh
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('categoryId', formData.categoryId);

      // Tách riêng hình cũ và mới
      const existingImages = images.filter(img => img.id && img.imageUrl);
      const newImages = images.filter(img => img.file);

      // Chuyển hình cũ thành file
      const existingImageFiles = await Promise.all(
        existingImages.map(async (img) => {
          try {
            const response = await fetch(img.url);
            const blob = await response.blob();
            return new File([blob], img.imageUrl.split('/').pop(), { type: blob.type });
          } catch (error) {
            console.error('Error converting existing image to file:', error);
            return null;
          }
        })
      );

      // Gửi tất cả hình ảnh (cả cũ và mới)
      [...existingImageFiles, ...newImages.map(img => img.file)].forEach((file, index) => {
        if (file) {
          formDataToSend.append('images', file);
        }
      });

      // Gửi thông tin thứ tự hình ảnh
      const imageOrder = [
        ...existingImages.map((img, index) => ({
          id: img.id,
          order: index
        })),
        ...newImages.map((_, index) => ({
          order: existingImages.length + index
        }))
      ];
      formDataToSend.append('imageOrder', JSON.stringify(imageOrder));

      // Log để debug
      console.log('FormData contents:');
      for (let pair of formDataToSend.entries()) {
        if (pair[0] === 'images') {
          console.log(pair[0] + ': [File]');
        } else {
          console.log(pair[0] + ': ' + pair[1]);
        }
      }

      // Gửi update product
      const response = await axios.put(
        `http://localhost:8080/api/products/${id}`,
        formDataToSend,
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          },
          timeout: 30000,
          validateStatus: function (status) {
            return status >= 200 && status < 300;
          }
        }
      );

      console.log('Server response:', response.data);

      // 2. Cập nhật số lượng size
      for (const size of sizes) {
        const newStock = (formData.productSizes.find(ps => ps.sizeId === size.id)?.stock) || 0;
        const oldStock = 0; // Không cần so sánh cũ mới ở đây
        const adjustment = newStock - oldStock;
        if (adjustment !== 0) {
          await axios.put(
            `http://localhost:8080/api/product-sizes/product/${id}/size/${size.id}/adjust-stock?adjustment=${adjustment}`
          );
        }
      }

      alert('Cập nhật sản phẩm thành công!');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Có lỗi xảy ra khi cập nhật sản phẩm. Vui lòng thử lại.');
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

              {/* Image Upload Section - kéo thả */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh sản phẩm</label>
                <div className="mt-2">
                  <div className="flex items-center justify-center w-full mb-4">
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
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="images" direction="horizontal">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                          {images.map((img, index) => (
                            <Draggable key={img.url} draggableId={img.url} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`relative group ${index === 0 ? 'col-span-2 row-span-2' : ''}`}
                                >
                                  <img
                                    src={img.url}
                                    alt={`Product ${index + 1}`}
                                    className={`w-full object-cover rounded-lg ${index === 0 ? 'h-48' : 'h-32'}`}
                                    style={{ background: '#eee' }}
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
                      value={formData.productSizes.find(ps => ps.sizeId === size.id)?.stock ?? 0}
                      onChange={e => handleSizeChange(size.id, e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      min="0"
                    />
                  </div>
                ))}
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