import { useState, useCallback, useMemo } from 'react';
import type { Product, CartItem } from '../types';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartError, setCartError] = useState<string | null>(null);

  const clearError = useCallback(() => setCartError(null), []);

  const addToCart = useCallback((product: Product): boolean => {
    const availableStock = product.stock_quantity ?? 0;
    if (availableStock <= 0) {
      setCartError(`Le produit "${product.name}" est en rupture de stock.`);
      return false;
    }

    let added = true;
    setItems(currentItems => {
      const existingIndex = currentItems.findIndex(item => item.id === product.id);
      if (existingIndex > -1) {
        const currentQty = currentItems[existingIndex].quantity;
        if (currentQty >= availableStock) {
          setCartError(`Stock maximum atteint (${availableStock}) pour "${product.name}".`);
          added = false;
          return currentItems;
        }
        setCartError(null);
        return currentItems.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      setCartError(null);
      return [...currentItems, { ...product, quantity: 1 }];
    });

    return added;
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId));
    setCartError(null);
  }, []);

  const updateQuantity = useCallback((productId: number, delta: number) => {
    setItems(currentItems =>
      currentItems.map(item => {
        if (item.id === productId) {
          const availableStock = item.stock_quantity ?? 0;
          const targetQty = item.quantity + delta;

          if (delta > 0 && targetQty > availableStock) {
            setCartError(`Stock maximum atteint (${availableStock}) pour "${item.name}".`);
            return item;
          }

          setCartError(null);
          const newQuantity = Math.max(0, targetQty);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCartError(null);
  }, []);

  const totalAmount = useMemo(() => 
    items.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0)
  , [items]);

  const totalItems = useMemo(() => 
    items.reduce((sum, item) => sum + item.quantity, 0)
  , [items]);

  return {
    items,
    cartError,
    clearError,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalAmount,
    totalItems
  };
}
