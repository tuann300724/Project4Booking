import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts, getAllSizes } from '../api/productService';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  // Fetch products and sizes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, sizesData] = await Promise.all([
          getAllProducts(),
          getAllSizes()
        ]);
        setProducts(productsData);
        setSizes(sizesData);
        setLoading(false);
      } catch (err) {
        setError('Đã có lỗi xin vui lòng thử lại');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products based on selected filters
  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || (product.category && product.category.name === selectedCategory);
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesSize = selectedSizes.length === 0 || 
      product.productSizes?.some(ps => selectedSizes.includes(ps.id.sizeId.toString()));
    return matchesCategory && matchesPrice && matchesSize;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
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
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Bộ lọc</h2>

            {/* Categories Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Danh mục</h3>
              <div className="space-y-2">
                {Array.from(new Set(products
                  .filter(p => p.category)
                  .map(p => p.category.name)
                )).map((category) => (
                  <div key={category}>
                    <button
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg ${
                        selectedCategory === category
                          ? 'bg-purple-100 text-purple-600'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Khoảng giá</h3>
              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="100000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>0đ</span>
                  <span>{priceRange[1].toLocaleString()}đ</span>
                </div>
              </div>
            </div>

            {/* Sizes Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Kích thước</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => {
                      setSelectedSizes(prev =>
                        prev.includes(size.id.toString())
                          ? prev.filter(s => s !== size.id.toString())
                          : [...prev, size.id.toString()]
                      );
                    }}
                    className={`px-3 py-1 border rounded-lg ${
                      selectedSizes.includes(size.id.toString())
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort Options */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  Hiển thị {sortedProducts.length} sản phẩm
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden group"
                >
                  <div className="relative h-48">
                    <img
                      src={product.productImages && product.productImages.length > 0 
                        ? `http://localhost:8080${product.productImages[0].imageUrl}`
                        : 'https://placehold.co/400x500?text=No+Image'}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                      <Link
                        to={`/products/${product.id}`}
                        className="bg-white text-gray-800 px-6 py-2 rounded-full hover:bg-purple-600 hover:text-white transition duration-300"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {product.name}
                    </h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-600 font-bold">
                          {product.price.toLocaleString()}đ
                        </span>
                        <button className="text-gray-600 hover:text-purple-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {product.productSizes
                          .filter(sizeInfo => sizeInfo.stock > 0)
                          .map(sizeInfo => (
                            <span
                              key={sizeInfo.id.sizeId}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
                            >
                              {sizeInfo.id.sizeId === 1 ? 'S' :
                               sizeInfo.id.sizeId === 2 ? 'M' :
                               sizeInfo.id.sizeId === 3 ? 'X' :
                               sizeInfo.id.sizeId === 4 ? 'XL'  : sizeInfo.id.sizeId}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;