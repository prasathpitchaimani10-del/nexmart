import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ICartData } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: ICartData | null;
  isLoading: boolean;
  itemCount: number;
  addToCart: (productId: string, variantSku?: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, variantSku: string | undefined, quantity: number) => Promise<void>;
  removeItem: (productId: string, variantSku?: string) => Promise<void>;
  toggleSaveForLater: (productId: string, variantSku: string | undefined, saveForLater: boolean) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<ICartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setIsLoading(true);
      const data = await api.getCart();
      setCart(data);
    } catch {
      // User may not have cart or session inactive
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, variantSku?: string, quantity = 1) => {
    if (!isAuthenticated) {
      toastError('Please log in to add items to your cart.');
      return;
    }
    try {
      const updated = await api.addToCart(productId, variantSku, quantity);
      setCart(updated);
      success('Item added to cart!');
    } catch (err: any) {
      toastError(err.message || 'Could not add item to cart.');
      throw err;
    }
  };

  const updateQuantity = async (productId: string, variantSku: string | undefined, quantity: number) => {
    try {
      const updated = await api.updateCartQuantity(productId, variantSku, quantity);
      setCart(updated);
    } catch (err: any) {
      toastError(err.message || 'Failed to update quantity.');
    }
  };

  const removeItem = async (productId: string, variantSku?: string) => {
    try {
      const updated = await api.removeFromCart(productId, variantSku);
      setCart(updated);
      success('Item removed from cart.');
    } catch (err: any) {
      toastError(err.message || 'Failed to remove item.');
    }
  };

  const toggleSaveForLater = async (productId: string, variantSku: string | undefined, saveForLater: boolean) => {
    try {
      const updated = await api.toggleSaveForLater(productId, variantSku, saveForLater);
      setCart(updated);
      success(saveForLater ? 'Moved to Saved for Later.' : 'Moved back to active cart.');
    } catch (err: any) {
      toastError(err.message || 'Failed to update item state.');
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      setCart(null);
    } catch (err: any) {
      console.warn('Clear cart error:', err);
    }
  };

  const itemCount = cart?.itemCount || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        itemCount,
        addToCart,
        updateQuantity,
        removeItem,
        toggleSaveForLater,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
