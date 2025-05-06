import React, { useState } from 'react';

const Products = () => {
  // Mock data cho categories
  const categories = [
    { id: 1, name: 'Áo', subcategories: ['Áo thun', 'Áo sơ mi', 'Áo khoác'] },
    { id: 2, name: 'Quần', subcategories: ['Quần jean', 'Quần kaki', 'Quần short'] },
    { id: 3, name: 'Phụ kiện', subcategories: ['Túi xách', 'Giày dép', 'Mũ nón'] },
  ];

  // Mock data cho products
  const products = [
    {
      id: 1,
      name: 'Áo thun basic',
      price: 250000,
      image: 'https://placehold.co/400x500?text=Ao+Thun',
      category: 'Áo',
      subcategory: 'Áo thun',
      sizes: ['S', 'M', 'L', 'XL'],
    },
    // Thêm các sản phẩm khác tương tự
  ];

  // State cho filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

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
                {categories.map((category) => (
                  <div key={category.id}>
                    <button
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg ${
                        selectedCategory === category.name
                          ? 'bg-purple-100 text-purple-600'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {category.name}
                    </button>
                    {selectedCategory === category.name && (
                      <div className="ml-4 mt-2 space-y-1">
                        {category.subcategories.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => setSelectedSubcategory(sub)}
                            className={`block w-full text-left px-3 py-1 rounded-lg text-sm ${
                              selectedSubcategory === sub
                                ? 'bg-purple-50 text-purple-600'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
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
                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSizes(prev =>
                        prev.includes(size)
                          ? prev.filter(s => s !== size)
                          : [...prev, size]
                      );
                    }}
                    className={`px-3 py-1 border rounded-lg ${
                      selectedSizes.includes(size)
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {size}
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
                <span className="text-gray-600">Hiển thị 1-12 của 36 sản phẩm</span>
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
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden group"
                >
                  <div className="relative h-48">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                      <button className="bg-white text-gray-800 px-6 py-2 rounded-full hover:bg-purple-600 hover:text-white transition duration-300">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {product.name}
                    </h3>
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
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button className="px-3 py-1 rounded-lg border hover:bg-gray-100">
                  Previous
                </button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    className={`px-3 py-1 rounded-lg border ${
                      page === 1
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="px-3 py-1 rounded-lg border hover:bg-gray-100">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;