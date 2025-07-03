import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getRelatedProducts, validateDiscountCode, getSizeById } from '../api/productService';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useSnackbar } from 'notistack';

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [isUserVoucher, setIsUserVoucher] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        // Lấy thông tin name cho từng size
        const productSizesWithName = await Promise.all(
          data.productSizes.map(async (sizeInfo) => {
            const sizeDetail = await getSizeById(sizeInfo.id.sizeId);
            return {
              ...sizeInfo,
              name: sizeDetail.name, // Gắn name vào
            };
          })
        );
        data.productSizes = productSizesWithName;
        setProduct(data);
        // Fetch related products after getting the main product
        if (data.category?.id) {
          const related = await getRelatedProducts(data.category.id, data.id);
          setRelatedProducts(related);
        }
        // Fetch featured products
        const response = await fetch('http://localhost:8080/api/products');
        const allProducts = await response.json();
        const featured = allProducts.filter(p => p.isFeatured === true && p.id !== data.id);
        setFeaturedProducts(featured);
        setLoading(false);
      } catch (err) {
        setError('Failed to load product details');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Reset active image index when product changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [product]);

  const handleQuantityChange = (value) => {
    // Find the selected size's stock
    const selectedSizeInfo = product.productSizes.find(
      sizeInfo => sizeInfo.name === selectedSize
    );

    if (!selectedSizeInfo) {
      alert('Vui lòng chọn kích thước trước');
      return;
    }

    if (value > selectedSizeInfo.stock) {
      alert(`Chỉ còn ${selectedSizeInfo.stock} sản phẩm trong kho`);
      setQuantity(selectedSizeInfo.stock);
      return;
    }

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

  const handleAddToCart = async () => {
    if (!selectedSize) {
      enqueueSnackbar('Vui lòng chọn kích thước', { 
        variant: 'warning',
        preventDuplicate: true
      });
      return;
    }

    // Check stock again before adding to cart
    const selectedSizeInfo = product.productSizes.find(
      sizeInfo => sizeInfo.name === selectedSize
    );

    if (quantity > selectedSizeInfo.stock) {
      enqueueSnackbar(`Chỉ còn ${selectedSizeInfo.stock} sản phẩm trong kho`, { 
        variant: 'error' 
      });
      setQuantity(selectedSizeInfo.stock);
      return;
    }

    try {
      await addToCart(product, selectedSize, quantity);
      
      enqueueSnackbar(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng`, {
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
        action: (key) => (
          <button 
            onClick={() => navigate('/cart')} 
            className="text-white font-medium underline"
          >
            Xem giỏ hàng
          </button>
        ),
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      enqueueSnackbar('Không thể thêm vào giỏ hàng', { variant: 'error' });
    }
  };

  const handleThumbnailClick = (index) => {
    setActiveImageIndex(index);
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
              {/* Main Image */}
              <div className="aspect-w-3 aspect-h-4 rounded-lg overflow-hidden h-[400px] border border-gray-200">
                <img
                  src={product.productImages.length > 0 
                    ? `http://localhost:8080${product.productImages[activeImageIndex]?.imageUrl}` 
                    : 'https://placehold.co/600x800?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              
              {/* Thumbnails */}
              {product.productImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto py-2">
                  {product.productImages.map((image, index) => (
                    <div 
                      key={image.id || index}
                      onClick={() => handleThumbnailClick(index)}
                      className={`cursor-pointer h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                        activeImageIndex === index ? 'border-purple-600' : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <img
                        src={`http://localhost:8080${image.imageUrl}`}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  ))}
                </div>
              )}
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

              {/* Size Selection */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Kích thước</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.productSizes.map((sizeInfo) => {
                    const sizeLabel = sizeInfo.name;
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
            </div>
          </div>

          {/* Description Section */}
          <div className="mt-8 p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô tả sản phẩm</h2>
            <div className="prose max-w-none">
              <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
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
                      src={relatedProduct.productImages && relatedProduct.productImages.length > 0 && relatedProduct.productImages[0].imageUrl
                        ? `http://localhost:8080${relatedProduct.productImages[0].imageUrl}`
                        : 'https://placehold.co/400x500?text=No+Image'}
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
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm nổi bật</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((featuredProduct) => (
                <Link
                  key={featuredProduct.id}
                  to={`/products/${featuredProduct.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="aspect-w-3 aspect-h-4">
                    <img
                      src={`http://localhost:8080${featuredProduct.productImages[0]?.imageUrl}` || 'https://placehold.co/600x800?text=No+Image'}
                      alt={featuredProduct.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {featuredProduct.name}
                    </h3>
                    <p className="text-xl font-bold text-purple-600">
                      {featuredProduct.price.toLocaleString()}đ
                    </p>
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
