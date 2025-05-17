import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { checkProductQuantity } from '../api/productService';
import { useSnackbar } from 'notistack';

const Card = () => {
  const { cart, removeFromCart, updateQuantity, loading } = useCart();
  const { enqueueSnackbar } = useSnackbar();
  const [productQuantities, setProductQuantities] = useState({});

  useEffect(() => {
    const fetchQuantities = async () => {
      try {
        const quantities = {};
        for (const item of cart) {
          try {
            const stock = await checkProductQuantity(item.product.id, item.size.name);
            quantities[`${item.product.id}-${item.size.name}`] = stock;
          } catch (error) {
            console.error(`Error checking quantity for product ${item.product.id}, size ${item.size.name}:`, error);
            quantities[`${item.product.id}-${item.size.name}`] = 0;
          }
        }
        setProductQuantities(quantities);
      } catch (err) {
        console.error('Error fetching quantities:', err);
      }
    };

    if (!loading) {
      fetchQuantities();
    }
  }, [cart, loading]);

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;

    const availableQuantity = productQuantities[`${item.product.id}-${item.size.name}`] || 0;
    
    if (newQuantity > availableQuantity) {
      enqueueSnackbar(`Chỉ còn ${availableQuantity} sản phẩm trong kho`, { variant: 'error' });
      return;
    }

    updateQuantity(item.id, newQuantity);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Giỏ hàng của bạn</h1>
        
        {cart.length === 0 ? (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg mb-6">Giỏ hàng của bạn đang trống</p>
            <Link 
              to="/products" 
              className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition duration-300 shadow-md hover:shadow-lg"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {cart.map((item) => {
                  const availableQuantity = productQuantities[`${item.product.id}-${item.size.name}`] || 0;

                  return (
                    <div key={item.id} className="flex items-center p-6 border-b last:border-b-0 hover:bg-gray-50 transition duration-200">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover rounded-lg shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/200x200?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="ml-6 flex-grow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.product.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="bg-gray-100 px-3 py-1 rounded-full">Size: {item.size.name}</span>
                          <span>{item.price.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100 transition duration-200"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="mx-4 w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100 transition duration-200"
                            disabled={item.quantity >= availableQuantity}
                          >
                            +
                          </button>
                          <span className="ml-2 text-sm text-gray-500">
                            Còn lại: {availableQuantity}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <p className="text-lg font-semibold text-purple-600 mb-2">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 transition duration-200 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Xóa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-4 border-b">Tổng đơn hàng</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính:</span>
                    <span>{calculateTotal().toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between text-lg font-semibold text-gray-800">
                      <span>Tổng cộng:</span>
                      <span className="text-purple-600">{calculateTotal().toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="mt-6 block w-full bg-purple-600 text-white text-center py-3 rounded-lg hover:bg-purple-700 transition duration-300 shadow-md hover:shadow-lg"
                >
                  Tiến hành thanh toán
                </Link>
                <Link
                  to="/products"
                  className="mt-4 block w-full text-center text-gray-600 hover:text-gray-800 transition duration-300"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card; 