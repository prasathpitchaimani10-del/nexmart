import React, { createContext, useContext, useState } from 'react';
import { IProduct } from '../types';
import { useToast } from './ToastContext';

interface CompareContextType {
  compareList: IProduct[];
  addToCompare: (product: IProduct) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<IProduct[]>([]);
  const { success, info, error: toastError } = useToast();

  const isInCompare = (productId: string) => {
    return compareList.some((p) => String(p._id) === String(productId));
  };

  const addToCompare = (product: IProduct) => {
    if (isInCompare(product._id)) {
      removeFromCompare(product._id);
      return;
    }
    if (compareList.length >= 4) {
      toastError('You can compare a maximum of 4 products at a time.');
      return;
    }
    setCompareList((prev) => [...prev, product]);
    success(`"${product.name.slice(0, 24)}..." added to comparison.`);
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => String(p._id) !== String(productId)));
    info('Product removed from comparison.');
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
