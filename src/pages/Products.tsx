import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { api } from '../services/api';
import { IProduct, ICategory } from '../types';
import { ProductGrid } from '../components/ProductGrid';
import { ProductFilter } from '../components/ProductFilter';
import { SortDropdown } from '../components/SortDropdown';
import { Pagination } from '../components/Pagination';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter states from URL or defaults
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = Number(searchParams.get('minPrice')) || 0;
  const maxPrice = Number(searchParams.get('maxPrice')) || 0;
  const rating = Number(searchParams.get('rating')) || 0;
  const inStock = searchParams.get('inStock') === 'true';
  const sort = searchParams.get('sort') || 'relevance';
  const page = Number(searchParams.get('page')) || 1;

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Load Categories & Brands
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const catRes = await api.getCategories();
        setCategories(catRes.categories || []);

        // Fetch sample products to extract brand list
        const sampleProds = await api.getProducts({ limit: 100 });
        const extractedBrands = Array.from(new Set(sampleProds.map((p) => p.brand).filter(Boolean)));
        setBrands(extractedBrands as string[]);
      } catch (err) {
        console.error('Fetch categories/brands error:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch Products based on URL query
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getProducts({
        search,
        category,
        subcategory,
        brand,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        rating: rating || undefined,
        inStock: inStock || undefined,
        sort,
        page,
        limit: 12,
      });
      setProducts(res || []);
      // Meta headers or estimate
      setTotalCount(res.length >= 12 ? 36 : res.length);
      setTotalPages(Math.max(1, Math.ceil(res.length / 12) + (res.length >= 12 ? 2 : 0)));
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, category, subcategory, brand, minPrice, maxPrice, rating, inStock, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key: string, value: any) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== undefined && value !== null && value !== '' && value !== 0 && value !== false) {
      newParams.set(key, String(value));
    } else {
      newParams.delete(key);
    }
    // reset page to 1 whenever filters change
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">
            {search ? `Search results for "${search}"` : category ? category : 'All Products Catalog'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Showing {products.length} results {category && `in ${category}`}
          </p>
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-1.5 shadow-sm"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <SortDropdown currentSort={sort} onSortChange={(s) => updateParam('sort', s)} />
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block">
          <ProductFilter
            categories={categories}
            selectedCategory={category}
            selectedSubcategory={subcategory}
            selectedBrand={brand}
            minPrice={minPrice}
            maxPrice={maxPrice}
            selectedRating={rating}
            inStockOnly={inStock}
            brands={brands}
            onCategoryChange={(c) => updateParam('category', c)}
            onSubcategoryChange={(sc) => updateParam('subcategory', sc)}
            onBrandChange={(b) => updateParam('brand', b)}
            onPriceChange={(min, max) => {
              const newParams = new URLSearchParams(searchParams);
              if (min) newParams.set('minPrice', String(min));
              else newParams.delete('minPrice');
              if (max) newParams.set('maxPrice', String(max));
              else newParams.delete('maxPrice');
              newParams.delete('page');
              setSearchParams(newParams);
            }}
            onRatingChange={(r) => updateParam('rating', r)}
            onInStockChange={(stk) => updateParam('inStock', stk)}
            onReset={handleResetFilters}
          />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-8">
          <ProductGrid
            products={products}
            isLoading={isLoading}
            onResetFilters={handleResetFilters}
          />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => updateParam('page', p)}
          />
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-zinc-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xs bg-white h-full p-5 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                <span className="font-bold text-sm text-zinc-900 uppercase">Filters</span>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-950"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ProductFilter
                categories={categories}
                selectedCategory={category}
                selectedSubcategory={subcategory}
                selectedBrand={brand}
                minPrice={minPrice}
                maxPrice={maxPrice}
                selectedRating={rating}
                inStockOnly={inStock}
                brands={brands}
                onCategoryChange={(c) => updateParam('category', c)}
                onSubcategoryChange={(sc) => updateParam('subcategory', sc)}
                onBrandChange={(b) => updateParam('brand', b)}
                onPriceChange={(min, max) => {
                  const newParams = new URLSearchParams(searchParams);
                  if (min) newParams.set('minPrice', String(min));
                  else newParams.delete('minPrice');
                  if (max) newParams.set('maxPrice', String(max));
                  else newParams.delete('maxPrice');
                  setSearchParams(newParams);
                }}
                onRatingChange={(r) => updateParam('rating', r)}
                onInStockChange={(stk) => updateParam('inStock', stk)}
                onReset={handleResetFilters}
              />
            </div>

            <div className="pt-4 border-t border-zinc-100 mt-6">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
