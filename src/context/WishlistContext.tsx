import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IProduct } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlist: IProduct[];
  count: number;
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.getWishlist();
      setWishlist(res.products || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => String(p._id) === String(productId));
  };

  const toggleWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      toastError('Please sign in to save products to your wishlist.');
      return;
    }
    try {
      const res = await api.toggleWishlist(productId);
      await refreshWishlist();
      success(res.isWishlisted ? 'Added to your wishlist.' : 'Removed from your wishlist.');
    } catch (err: any) {
      toastError(err.message || 'Failed to update wishlist.');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        count: wishlist.length,
        isLoading,
        isInWishlist,
        toggleWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
