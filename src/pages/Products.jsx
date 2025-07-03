import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAllProducts, getAllSizes, getSizeById } from '../api/productService';
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const Products = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get('category');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // State cho filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId || '');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          
          // Nếu có categoryId trong URL, đặt selectedCategory thành category tương ứng
          if (categoryId && data.length > 0) {
            const category = data.find(cat => cat.id.toString() === categoryId);
            if (category) {
              setSelectedCategory(category.name);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, [categoryId]);

  // Fetch products based on category
  useEffect(() => {
    const buildFilterQuery = () => {
      const params = [];
      if (selectedCategory) params.push(`category=${encodeURIComponent(selectedCategory)}`);
      if (priceRange[0] > 0) params.push(`minPrice=${priceRange[0]}`);
      if (priceRange[1] < 1000000) params.push(`maxPrice=${priceRange[1]}`);
      if (selectedSizes.length > 0) {
        // Lấy tên size từ id
        const selectedSizeNames = sizes
          .filter(size => selectedSizes.includes(size.id))
          .map(size => size.name);
        selectedSizeNames.forEach(sizeName => {
          params.push(`sizes=${encodeURIComponent(sizeName)}`);
        });
      }
      return params.length > 0 ? '?' + params.join('&') : '';
    };

    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const query = buildFilterQuery();
        const response = await fetch(`http://localhost:8080/api/products/filter${query}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          console.log('Products from API:', data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setProducts([]);
      }
      setLoading(false);
    };

    fetchFilteredProducts();
  }, [selectedCategory, priceRange, selectedSizes]);

  // Fetch sizes
  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const sizesData = await getAllSizes();
        setSizes(sizesData);
      } catch (err) {
        console.error('Error fetching sizes:', err);
      }
    };

    fetchSizes();
  }, []);

  // Handle category selection
  const handleCategorySelect = (category, id) => {
    setSelectedCategory(category);
    setSelectedCategoryId(id.toString());
    setSelectedSizes([]); // reset size filter khi đổi danh mục
  };

  // Map categoryId sang catesize
  const getCateSizeByCategoryId = (catId) => {
    const shoesCategoryIds = [3]; // hoặc thêm các id khác nếu có nhiều loại giày
    if (shoesCategoryIds.includes(Number(catId))) return 'shoes';
    if (!catId) return null; // Tất cả sản phẩm
    return 'clothes';
  };

  const cateSizeFilter = getCateSizeByCategoryId(selectedCategoryId);

  // Filter products based on selected filters
  const filteredProducts = products.filter(product => {
    // Bỏ lọc theo danh mục vì đã lọc bằng API
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesSize = selectedSizes.length === 0 || 
      product.productSizes?.some(ps => selectedSizes.includes(ps.id.sizeId.toString()));
    return matchesPrice && matchesSize;
  });

  // Sort products
  const sortedProducts = products; // Không filter lại!

  // Group sizes by catesize
  const groupedSizes = sizes.reduce((acc, size) => {
    if (!acc[size.catesize]) acc[size.catesize] = [];
    acc[size.catesize].push(size);
    return acc;
  }, {});

  const handleSizeClick = (size) => {
    // Nếu chưa chọn category hoặc category khác với catesize của size, thì set lại category
    if (!selectedCategory || selectedCategory !== size.catesize) {
      setSelectedCategory(size.catesize);
      // Nếu bạn dùng selectedCategoryId, cần map từ name sang id:
      const cat = categories.find(cat => cat.name === size.catesize);
      if (cat) setSelectedCategoryId(cat.id.toString());
      // Reset lại selectedSizes chỉ còn size vừa chọn
      setSelectedSizes([size.id]);
    } else {
      // Nếu đã đúng loại, toggle chọn size như cũ
      if (selectedSizes.includes(size.id)) {
        setSelectedSizes(selectedSizes.filter(id => id !== size.id));
      } else {
        setSelectedSizes([...selectedSizes, size.id]);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-purple-600 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md text-gray-700 hover:bg-gray-50"
          >
            <FiFilter />
            <span>Bộ lọc</span>
            {isFilterOpen ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`w-full md:w-64 bg-white rounded-lg shadow-md p-6 transition-all duration-300 ${
            isFilterOpen ? 'block' : 'hidden md:block'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Bộ lọc</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="md:hidden text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Categories Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3 text-gray-700">Danh mục</h3>
              <div className="space-y-2">
                <div>
                  <button
                    onClick={() => handleCategorySelect('', '')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      !selectedCategory 
                        ? 'bg-purple-100 text-purple-600 font-medium' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    Tất cả sản phẩm
                  </button>
                </div>
                {categories.map((category) => (
                  <div key={category.id}>
                    <button
                      onClick={() => handleCategorySelect(category.name, category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.name
                          ? 'bg-purple-100 text-purple-600 font-medium'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {category.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3 text-gray-700">Khoảng giá</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="100000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{priceRange[0].toLocaleString()}đ</span>
                  <span>{priceRange[1].toLocaleString()}đ</span>
                </div>
              </div>
            </div>

            {/* Size Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3 text-gray-700">Kích thước</h3>
              {Object.keys(groupedSizes).length === 0 ? (
                <span className="text-gray-400 italic">Không có kích thước phù hợp</span>
              ) : (
                Object.entries(groupedSizes)
                  .filter(([catesize]) => !selectedCategory || catesize === selectedCategory)
                  .map(([catesize, sizeList]) => (
                    <div key={catesize} className="mb-2">
                      <div className="font-semibold text-purple-700 mb-1">{catesize}</div>
                      <div className="flex flex-wrap gap-2">
                        {sizeList.map((size) => (
                          <button
                            key={size.id}
                            onClick={() => handleSizeClick(size)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              selectedSizes.includes(size.id)
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {size.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort Options */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-gray-600">
                  Hiển thị {sortedProducts.length} sản phẩm {selectedCategory && `trong ${selectedCategory}`}
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {sortedProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 16h.01M12 13a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h2>
                <p className="text-gray-600">Không có sản phẩm nào phù hợp với bộ lọc đã chọn.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <div className="relative h-72 overflow-hidden">
                      <img
                        src={product.productImages && product.productImages.length > 0 
                          ? `http://localhost:8080${product.productImages[0].imageUrl}`
                          : 'https://placehold.co/400x500?text=No+Image'}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/400x500?text=No+Image';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                        <Link
                          to={`/products/${product.id}`}
                          className="bg-white text-gray-800 px-6 py-2.5 rounded-full hover:bg-purple-600 hover:text-white transition duration-300 transform hover:scale-105 font-medium shadow-lg"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                      {/* <div className="absolute top-3 right-3">
                        <button className="bg-white/90 hover:bg-white text-gray-600 hover:text-purple-600 p-2 rounded-full shadow-md transition duration-300 transform hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div> */}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="text-purple-600 font-bold text-xl">
                            {product.price.toLocaleString()}đ
                          </span>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Mới</span>
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;