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
    isFeatured: false,
    productSizes: [],
  });
  const [stockData, setStockData] = useState({});
  const [stockChanges, setStockChanges] = useState({});
  const [showStockNotification, setShowStockNotification] = useState(false);
  const [initialStockData, setInitialStockData] = useState({});
  const [existingProductSizeIds, setExistingProductSizeIds] = useState([]);

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
        // Fetch all sizes (chuẩn)
        const sizesResponse = await axios.get('http://localhost:8080/api/sizes');
        const allSizes = sizesResponse.data;
        // Lọc size chuẩn theo loại sản phẩm
        const filteredSizes = allSizes.filter(size => size.catesize === product.category.name);
        setSizes(filteredSizes);
        // Fetch size đã có của product (nếu có)
        let sizesOfProduct = [];
        try {
          const sizesOfProductRes = await axios.get(`http://localhost:8080/api/sizes/product/${id}`);
          sizesOfProduct = sizesOfProductRes.data;
        } catch (err) {
          if (err.response && err.response.status === 404) {
            sizesOfProduct = [];
          } else {
            throw err;
          }
        }
        setExistingProductSizeIds(sizesOfProduct.map(s => s.sizeId || s.id));
        // Fetch productSizes (stock theo size) từ API riêng (nếu có)
        let productSizesFromApi = [];
        try {
          const productSizesRes = await axios.get(`http://localhost:8080/api/product-sizes/product/${id}`);
          productSizesFromApi = productSizesRes.data;
        } catch (err) {
          if (err.response && err.response.status === 404) {
            productSizesFromApi = [];
          } else {
            throw err;
          }
        }
        // Map đủ các size chuẩn, nếu thiếu thì stock = 0
        const productSizes = filteredSizes.map(size => {
          const found = productSizesFromApi.find(ps => ps.sizeId === size.id);
          return found ? { sizeId: size.id, stock: found.stock } : { sizeId: size.id, stock: 0 };
        });
        // Set images - productImages is already an array of image objects
        if (product.productImages && Array.isArray(product.productImages)) {
          const productImages = product.productImages.map(img => {
            return {
              id: img.id,
              url: `http://localhost:8080${img.imageUrl}`,
              imageUrl: img.imageUrl,
              file: null,
              isExisting: true
            };
          });
          setImages(productImages);
        }
        // Set form data
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId: product.category.id,
          isFeatured: product.isFeatured,
          productSizes,
        });
        // Set stock data
        setStockData(productSizes.reduce((acc, ps) => ({ ...acc, [ps.sizeId]: ps.stock }), {}));
        setInitialStockData(productSizes.reduce((acc, ps) => ({ ...acc, [ps.sizeId]: ps.stock }), {}));
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

  // Xử lý khi tải lên hình ảnh mới
  const handleImageUpload = (e) => {
    e.preventDefault();
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    console.log(`Processing ${files.length} new image files`);

    const newImages = files.map(file => {
      // Generate a temporary id using timestamp and random string
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      console.log(`Created new image with temp ID: ${tempId} from file: ${file.name}`);
      return {
        id: tempId,  // Temporary ID for new files
        url: URL.createObjectURL(file),
        file: file,
        isNew: true
      };
    });

    setImages(prev => [...prev, ...newImages]);
    // Reset file input
    e.target.value = null;
  };

  // Xóa hình khỏi images state
  const handleRemoveImage = (indexToRemove) => {
    setImages(prev => {
      const imageToRemove = prev[indexToRemove];
      console.log(`Removing image at index ${indexToRemove}`, imageToRemove);

      // If this is a URL from an existing image, revoke it
      if (imageToRemove.url && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(images);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setImages(reordered);
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('isFeatured', formData.isFeatured);

      // Tách riêng hình cũ và mới
      const existingImages = images.filter(img => img.id && typeof img.id === 'number');
      const newImages = images.filter(img => img.file);

      console.log('Existing images before submission:', existingImages);
      console.log('New images before submission:', newImages);

      // Gửi thông tin về các ảnh cũ (chỉ cần gửi ID)
      if (existingImages.length > 0) {
        const existingImageIds = existingImages.map(img => img.id);
        formDataToSend.append('existingImageIds', JSON.stringify(existingImageIds));
        console.log('Existing image IDs:', JSON.stringify(existingImageIds));
      } else {
        // Nếu không có ảnh cũ nào, gửi một mảng rỗng để backend biết là xóa tất cả ảnh cũ
        formDataToSend.append('existingImageIds', JSON.stringify([]));
        console.log('No existing images to keep, sending empty array');
      }

      // Thêm các file mới vào form data
      if (newImages.length > 0) {
        newImages.forEach((img, index) => {
          if (img.file) {
            formDataToSend.append('images', img.file);
            console.log(`Adding new image #${index} named ${img.file.name} to form data`);
          }
        });
      }

      // Log để debug
      console.log('FormData contents:');
      for (let pair of formDataToSend.entries()) {
        if (pair[0] === 'images') {
          console.log(pair[0] + ': [File ' + pair[1].name + ']');
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
          timeout: 60000, // Tăng timeout lên 60 giây
        }
      );

      console.log('Server response:', response.data);

      // 2. Cập nhật số lượng size
      for (const size of sizes) {
        const sizeId = size.id;
        const newStock = formData.productSizes.find(ps => ps.sizeId === sizeId)?.stock || 0;
        const oldStock = stockData[sizeId] || 0;
        const adjustment = newStock - oldStock;
        if (existingProductSizeIds.includes(sizeId)) {
          // Đã có, update như cũ
          if (adjustment !== 0) {
            try {
              await axios.put(
                `http://localhost:8080/api/product-sizes/product/${id}/size/${sizeId}/adjust-stock?adjustment=${adjustment}`,
                {},
                { headers: { 'Content-Type': 'application/json' } }
              );
            } catch (sizeError) {
              console.error(`Error updating size ${sizeId}:`, sizeError);
            }
          }
        } else if (newStock > 0) {
          // Size thuộc loại sản phẩm nhưng chưa có trong product, tạo mới
          try {
            await axios.post(
              'http://localhost:8080/api/product-sizes',
              {
                productId: Number(id),
                sizeId: sizeId,
                stock: newStock
              },
              { headers: { 'Content-Type': 'application/json' } }
            );
          } catch (err) {
            console.error(`Error creating product-size for size ${sizeId}:`, err);
          }
        }
      }

      alert('Cập nhật sản phẩm thành công!');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      console.error('Error response:', error.response?.data);
      alert('Có lỗi xảy ra khi cập nhật sản phẩm: ' + (error.response?.data || error.message));
    } finally {
      setUploading(false);
    }
  };

  // Hàm để thay đổi số lượng
  const handleStockChange = (sizeId, value) => {
    const newValue = value === '' ? 0 : parseInt(value) || 0;
    const oldValue = initialStockData[sizeId] || 0;
    setStockData(prev => ({
      ...prev,
      [sizeId]: newValue
    }));
    setStockChanges(prev => ({
      ...prev,
      [sizeId]: newValue - oldValue
    }));
  };

  // Hàm để cập nhật số lượng
  const handleUpdateStock = async () => {
    try {
      // Chỉ cập nhật những size có thay đổi
      const updatedSizes = Object.entries(stockChanges)
        .filter(([_, change]) => change !== 0)
        .map(([sizeId]) => Number(sizeId));

      if (updatedSizes.length === 0) {
        alert('Không có thay đổi nào để cập nhật!');
        return;
      }

      for (const sizeId of updatedSizes) {
        const change = stockChanges[sizeId];
        if (existingProductSizeIds.includes(sizeId)) {
          // Đã có, update stock
          try {
            await axios.put(
              `http://localhost:8080/api/product-sizes/product/${id}/size/${sizeId}/adjust-stock`,
              {},
              {
                params: { adjustment: change },
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                timeout: 10000
              }
            );
          } catch (sizeError) {
            console.error(`Error updating size ${sizeId}:`, sizeError);
            throw new Error(`Không thể cập nhật số lượng cho size ${sizeId}: ${sizeError.message}`);
          }
        } else if (change > 0) {
          // Chưa có, tạo mới product-size
          try {
            await axios.post(
              'http://localhost:8080/api/product-sizes',
              {
                productId: Number(id),
                sizeId: sizeId,
                stock: change
              },
              { headers: { 'Content-Type': 'application/json' } }
            );
          } catch (err) {
            console.error(`Error creating product-size for size ${sizeId}:`, err);
            throw new Error(`Không thể tạo mới product-size cho size ${sizeId}: ${err.message}`);
          }
        }
        // Nếu là size mới mà change < 0 thì bỏ qua, không cho tạo mới với số âm
      }

      setShowStockNotification(true);
      setTimeout(() => setShowStockNotification(false), 3000);
      setStockChanges({});
    } catch (error) {
      console.error('Error updating stock:', error);
      alert(error.message || 'Có lỗi xảy ra khi cập nhật số lượng. Vui lòng thử lại.');
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
                <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
                  {categories.find(cat => cat.id == formData.categoryId)?.name || 'Không xác định'}
                </div>
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
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Kích thước và số lượng</h3>
                <button
                  type="button"
                  onClick={handleUpdateStock}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  Cập nhật số lượng
                </button>
              </div>
              <div className="space-y-4">
                {sizes.map(size => {
                  const change = stockChanges[size.id] || 0;
                  return (
                    <div key={size.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="w-24 text-sm font-medium text-gray-700">{size.name}</label>
                      <input
                        type="number"
                        value={stockData[size.id] || 0}
                        onChange={(e) => handleStockChange(size.id, e.target.value)}
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        min="0"
                      />

                      {change !== 0 && (
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${change > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                          {change > 0 ? '+' : ''}{change}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Thêm checkbox isFeatured */}
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
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              disabled={uploading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang lưu...
                </>
              ) : 'Lưu thay đổi'}
            </button>
          </div>
        </form>

        {/* Stock Update Notification */}
        {showStockNotification && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-fade-in-up">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Cập nhật số lượng thành công!
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProduct; 