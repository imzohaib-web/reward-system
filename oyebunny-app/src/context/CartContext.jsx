'use client';

import { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addToCart = (product, quantity = 1) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevItems, { product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setItems((prevItems) => prevItems.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Cart Metrics: Crucial distinction between total quantity and distinct product count
  const cartSummary = useMemo(() => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const distinctProductsCount = new Set(items.map((i) => i.product.id)).size;
    const subtotal = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const qualifiesFor3ProductReward = distinctProductsCount >= 3;

    return {
      totalQuantity,
      distinctProductsCount,
      subtotal,
      qualifiesFor3ProductReward,
    };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        ...cartSummary,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
