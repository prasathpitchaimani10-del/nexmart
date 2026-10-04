import React from 'react';
import { IProduct } from '../types';
import { ProductCard } from './ProductCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

interface ProductGridProps {
  products: IProduct[];
  isLoading: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your search criteria, clearing selected filters, or browsing other categories.',
  onResetFilters,
}) => {
  if (isLoading) {
    return <LoadingSkeleton count={8} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionText={onResetFilters ? 'Clear All Filters' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};
