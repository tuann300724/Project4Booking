import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getRelatedProducts, validateDiscountCode } from '../api/productService';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [isUserVoucher, setIsUserVoucher] = useState(false);
  const { addToCart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        // Fetch related products after getting the main product
        if (data.category?.id) {
          const related = await getRelatedProducts(data.category.id, data.id);
          setRelatedProducts(related);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load product details');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (value) => {
    if (value >= 1) {
      setQuantity(value);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      // First try product discount
      const discount = await validateDiscountCode(discountCode);
      setAppliedDiscount(discount);
      setIsUserVoucher(false);
      setDiscountError('');
    } catch (err) {
      // If product discount fails, try user voucher
      if (user?.id) {
        try {
          const response = await fetch(`http://localhost:8080/api/vouchers/use?userId=${user.id}&code=${discountCode}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const voucher = await response.json();
            setAppliedDiscount(voucher);
            setIsUserVoucher(true);
            setDiscountError('');
          } else {
            const errorData = await response.text();
            setDiscountError(errorData);
            setAppliedDiscount(null);
          }
        } catch (voucherErr) {
          setDiscountError('Không thể kiểm tra mã giảm giá. Vui lòng thử lại.');
          setAppliedDiscount(null);
        }
      } else {
        setDiscountError('Bạn cần đăng nhập để sử dụng mã giảm giá cá nhân');
        setAppliedDiscount(null);
      }
    }
  };

  const calculateDiscountedPrice = () => {
    if (!product || !appliedDiscount) return product.price;

    const discountType = appliedDiscount.discount_type || appliedDiscount.discountType;
    const discountValue = appliedDiscount.discount_value || appliedDiscount.discountValue;

    if (discountType === 'percentage') {
      return product.price * (1 - discountValue / 100);
    } else {
      return Math.max(0, product.price - discountValue);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Vui lòng chọn kích thước');
      return;
    }

    const productToAdd = {
      id: product.id,
      name: product.name,
      price: appliedDiscount ? calculateDiscountedPrice() : product.price,
      image: `http://localhost:8080${product.productImages[0]?.imageUrl}`,
      size: selectedSize,
      quantity: quantity,
      discountCode: appliedDiscount?.code,
      isUserVoucher: isUserVoucher,
      userId: isUserVoucher ? user?.id : null
    };

    addToCart(productToAdd);
  };

  const getSizeLabel = (sizeId) => {
    const sizeMap = {
      1: 'S',
      2: 'M',
      3: 'X',
      4: 'XL',
    };
    return sizeMap[sizeId] || sizeId;
  };

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

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Product not found</div>
      </div>
    );
  }
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-w-3 aspect-h-4 rounded-lg overflow-hidden h-[400px]">
                <img
                  src={ product.productImages[0]?.imageUrl != undefined ? `http://localhost:8080${product.productImages[0]?.imageUrl}` : 'https://placehold.co/600x800?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.productSizes.map((sizeInfo) => {
                    const sizeLabel = getSizeLabel(sizeInfo.id.sizeId);
                    const isOutOfStock = sizeInfo.stock <= 0;
                    return (
                      <button
                        key={sizeInfo.id.sizeId}
                        onClick={() => !isOutOfStock && setSelectedSize(sizeLabel)}
                        disabled={isOutOfStock}
                        className={`relative p-3 border rounded-lg text-center ${
                          selectedSize === sizeLabel
                            ? 'bg-purple-600 text-white border-purple-600'
                            : isOutOfStock
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span className="block font-medium">{sizeLabel}</span>
                        <span className="block text-sm mt-1">
                          {isOutOfStock ? 'Hết hàng' : `Còn ${sizeInfo.stock} sản phẩm`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Số lượng</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100"
                    disabled={quantity <= 1}
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

              {/* Discount Code */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Mã giảm giá</h2>
                {product.discount ? (
                  <>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        placeholder="Nhập mã giảm giá"
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleApplyDiscount}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-300"
                      >
                        Áp dụng
                      </button>
                    </div>
                    {discountError && (
                      <p className="mt-2 text-red-600 text-sm">{discountError}</p>
                    )}
                    {appliedDiscount && (
                      <p className="mt-2 text-green-600 text-sm">
                        Đã áp dụng {isUserVoucher ? 'voucher' : 'mã giảm giá'}: {appliedDiscount.code}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">Sản phẩm này không áp dụng mã giảm giá</p>
                )}
              </div>

              {/* Price Display */}
              <div>
                <h2 className="text-lg font-semibold mb-2">Giá</h2>
                <div className="flex items-center space-x-2">
                  {appliedDiscount ? (
                    <>
                      <span className="text-gray-500 line-through">
                        {product.price.toLocaleString()}đ
                      </span>
                      <span className="text-2xl font-bold text-purple-600">
                        {calculateDiscountedPrice().toLocaleString()}đ
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-purple-600">
                      {product.price.toLocaleString()}đ
                    </span>
                  )}
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
              {/* <div>
                <h2 className="text-lg font-semibold mb-4">Thông tin sản phẩm</h2>
                <ul className="space-y-2">
                  <li className="text-gray-600">Danh mục: {product.category?.name || 'Chưa phân loại'}</li>
                </ul>
              </div> */}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/products/${relatedProduct.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="aspect-w-3 aspect-h-4">
                    <img
                      src={`http://localhost:8080${relatedProduct.productImages[0]?.imageUrl}` || 'https://placehold.co/600x800?text=No+Image'}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-xl font-bold text-purple-600">
                      {relatedProduct.price.toLocaleString()}đ
                    </p>
                    {/* <div className="mt-2 flex flex-wrap gap-2">
                      {relatedProduct.productSizes.map((sizeInfo) => (
                        <span
                          key={sizeInfo.id.sizeId}
                          className={`px-2 py-1 text-sm rounded ${
                            sizeInfo.stock > 0
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {getSizeLabel(sizeInfo.id.sizeId)}
                        </span>
                      ))}
                    </div> */}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
