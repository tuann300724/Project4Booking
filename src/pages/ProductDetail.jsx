import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Mock data cho sản phẩm
  const product = {
    id: 1,
    name: 'Áo thun basic',
    price: 250000,
    description: 'Áo thun basic với chất liệu cotton 100%, thoáng mát và thoải mái. Thiết kế đơn giản, dễ phối đồ và phù hợp cho mọi dịp.',
    images: [
      'https://placehold.co/600x800?text=Ao+Thun+1',
      'https://placehold.co/600x800?text=Ao+Thun+2',
      'https://placehold.co/600x800?text=Ao+Thun+3',
      'https://placehold.co/600x800?text=Ao+Thun+4',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    details: [
      'Chất liệu: Cotton 100%',
      'Kiểu dáng: Regular fit',
      'Cổ áo: Cổ tròn',
      'Chiều dài: 65cm',
      'Chiều rộng vai: 45cm',
      'Chiều dài tay: 20cm',
    ],
  };

  const handleQuantityChange = (value) => {
    if (value >= 1) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Vui lòng chọn kích thước');
      return;
    }
    // Xử lý thêm vào giỏ hàng
    console.log('Thêm vào giỏ hàng:', {
      product,
      size: selectedSize,
      quantity,
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-w-3 aspect-h-4 rounded-lg overflow-hidden h-[400px]">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden h-24 cursor-pointer hover:opacity-75"
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <p className="text-2xl font-bold text-purple-600">
                  {product.price.toLocaleString()}đ
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">Mô tả</h2>
                <p className="text-gray-600">{product.description}</p>
              </div>

              {/* Size Selection */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Kích thước</h2>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg ${
                        selectedSize === size
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Số lượng</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                    className="w-16 text-center border rounded-lg py-1"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition duration-300"
              >
                Thêm vào giỏ hàng
              </button>

              {/* Product Details */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Chi tiết sản phẩm</h2>
                <ul className="space-y-2">
                  {product.details.map((detail, index) => (
                    <li key={index} className="text-gray-600">
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;