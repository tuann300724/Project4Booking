import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart, getSizeIdByName } from '../api/productService';
import { useSnackbar } from 'notistack';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useUser();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchCart = async () => {
      if (user?.id) {
        try {
          const cartData = await getCart(user.id);
          const transformedItems = cartData.items.map(item => ({
            id: item.id,
            product: {
              id: item.productId,
              name: item.productName,
              image: item.image || 'https://placehold.co/200x200?text=No+Image'
            },
            size: {
              id: item.sizeId,
              name: item.sizeName
            },
            quantity: item.quantity,
            price: item.price
          }));
          setCart(transformedItems);
        } catch (error) {
          console.error('Error fetching cart:', error);
          setCart([]);
        }
      } else {
        setCart([]);
      }
      setLoading(false);
    };

    fetchCart();
  }, [user]);

  const addToCartHandler = async (product, size, quantity = 1) => {
    if (!user?.id) {
      enqueueSnackbar('Vui lòng đăng nhập để thêm vào giỏ hàng', { variant: 'warning' });
      return;
    }

    try {
      console.log('Adding to cart:', { userId: user.id, productId: product.id, size, quantity });
      const sizeId = await getSizeIdByName(size);
      console.log('Size ID:', sizeId);
      
      if (!sizeId) {
        enqueueSnackbar('Size không hợp lệ', { variant: 'error' });
        return;
      }

      console.log('Calling addToCart API with:', { userId: user.id, productId: product.id, sizeId, quantity });
      const updatedCart = await addToCart(user.id, product.id, sizeId, quantity);
      console.log('API Response:', updatedCart);
      
      const transformedItems = updatedCart.items.map(item => ({
        id: item.id,
        product: {
          id: item.productId,
          name: item.productName,
          image: item.image || 'https://placehold.co/200x200?text=No+Image'
        },
        size: {
          id: item.sizeId,
          name: item.sizeName
        },
        quantity: item.quantity,
        price: item.price
      }));
      setCart(transformedItems);
    } catch (error) {
      console.error('Error adding to cart:', error);
      enqueueSnackbar('Không thể thêm vào giỏ hàng', { variant: 'error' });
      throw error;
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (!user?.id) return;

    try {
      const updatedCart = await updateCartItem(cartItemId, newQuantity);
      const transformedItems = updatedCart.items.map(item => ({
        id: item.id,
        product: {
          id: item.productId,
          name: item.productName,
          image: item.image || 'https://placehold.co/200x200?text=No+Image'
        },
        size: {
          id: item.sizeId,
          name: item.sizeName
        },
        quantity: item.quantity,
        price: item.price
      }));
      setCart(transformedItems);
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!user?.id) return;

    try {
      await removeCartItem(cartItemId);
      setCart(prevCart => prevCart.filter(item => item.id !== cartItemId));
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCartHandler = async () => {
    if (!user?.id) return;

    try {
      await clearCart(user.id);
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    addToCart: addToCartHandler,
    updateQuantity,
    removeFromCart,
    clearCart: clearCartHandler,
    getTotalItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 