import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];
      return parsedCart;
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
    }
  }, [cart]);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => 
        item.id === product.id && item.size === product.size
      );
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id && item.size === product.size
            ? { ...item, quantity: (item.quantity || 0) + (product.quantity || 1) }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: product.quantity || 1 }];
    });
  };

  const removeFromCart = (productId, size) => {
    setCart(prevCart => 
      prevCart.filter(item => !(item.id === productId && item.size === size))
    );
  };

  const updateQuantity = (productId, size, quantity) => {
    if (quantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId && item.size === size
          ? { ...item, quantity: parseInt(quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    const total = cart.reduce((total, item) => {
      const quantity = parseInt(item.quantity) || 0;
      return total + quantity;
    }, 0);
    return total;
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 