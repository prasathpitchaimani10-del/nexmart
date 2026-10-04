import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ICategory, IProduct } from '../types';
import { ProductGrid } from '../components/ProductGrid';
import { SortDropdown } from '../components/SortDropdown';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<ICategory | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [activeSubcat, setActiveSubcat] = useState('');
  const [sort, setSort] = useState('relevance');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!slug) return;
      try {
        setIsLoading(true);
        const res = await api.getCategoryBySlug(slug);
        setCategory(res.category);
        setProducts(res.products || []);
      } catch (err) {
        console.error('Category load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategoryData();
  }, [slug]);

  const filteredProducts = activeSubcat
    ? products.filter((p) => p.subcategory?.toLowerCase() === activeSubcat.toLowerCase())
    : products;

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'price_asc') return a.pricing.price - b.pricing.price;
    if (sort === 'price_desc') return b.pricing.price - a.pricing.price;
    if (sort === 'rating') return b.rating - a.rating;
    if (sort === 'popularity') return b.reviewCount - a.reviewCount;
    return 0;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Category Hero Header */}
      {category && (
        <div className="relative bg-zinc-950 text-white py-12 sm:py-16">
          <div className="absolute inset-0 opacity-25">
            <img src={category.image} alt={category.name} className="w-full h-full object-cover object-center" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-xs font-semibold text-zinc-400 mb-2">Category Showcase</div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{category.name}</h1>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-xl">{category.description}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Subcategories Filter & Sort Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
          {category && category.subcategories?.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <button
                type="button"
                onClick={() => setActiveSubcat('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  !activeSubcat
                    ? 'bg-zinc-950 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-950'
                }`}
              >
                All {category.name}
              </button>
              {category.subcategories.map((subcat) => (
                <button
                  key={subcat}
                  type="button"
                  onClick={() => setActiveSubcat(subcat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                    activeSubcat === subcat
                      ? 'bg-zinc-950 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {subcat}
                </button>
              ))}
            </div>
          )}

          <SortDropdown currentSort={sort} onSortChange={setSort} />
        </div>

        {/* Products Grid */}
        <ProductGrid
          products={sortedProducts}
          isLoading={isLoading}
          emptyTitle={`No products found in ${category?.name || 'this category'}`}
          emptyDescription="Check back soon as we continuously restock items."
        />
      </div>
    </div>
  );
};
