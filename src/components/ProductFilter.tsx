import React from 'react';
import { RotateCcw } from 'lucide-react';
import { ICategory } from '../types';

interface ProductFilterProps {
  categories: ICategory[];
  selectedCategory: string;
  selectedSubcategory: string;
  selectedBrand: string;
  minPrice: number;
  maxPrice: number;
  selectedRating: number;
  inStockOnly: boolean;
  brands: string[];
  onCategoryChange: (cat: string) => void;
  onSubcategoryChange: (subcat: string) => void;
  onBrandChange: (brand: string) => void;
  onPriceChange: (min: number, max: number) => void;
  onRatingChange: (rating: number) => void;
  onInStockChange: (inStock: boolean) => void;
  onReset: () => void;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  categories,
  selectedCategory,
  selectedSubcategory,
  selectedBrand,
  minPrice,
  maxPrice,
  selectedRating,
  inStockOnly,
  brands,
  onCategoryChange,
  onSubcategoryChange,
  onBrandChange,
  onPriceChange,
  onRatingChange,
  onInStockChange,
  onReset,
}) => {
  const currentCategoryObj = categories.find((c) => c.name.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <aside className="w-full bg-white rounded-xl border border-zinc-200 p-5 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <h3 className="text-sm font-bold text-zinc-900 tracking-wide uppercase">Filters</h3>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-zinc-500 hover:text-zinc-950 flex items-center gap-1 font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Stock Availability Toggle */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-zinc-800">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="w-4 h-4 rounded text-zinc-950 border-zinc-300 focus:ring-zinc-900"
          />
          <span>Exclude Out of Stock</span>
        </label>
      </div>

      {/* Category */}
      <div>
        <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2.5">Category</h4>
        <div className="space-y-1 text-xs">
          <button
            type="button"
            onClick={() => {
              onCategoryChange('');
              onSubcategoryChange('');
            }}
            className={`w-full text-left py-1 px-2 rounded-md transition-colors ${
              !selectedCategory ? 'bg-zinc-100 font-bold text-zinc-950' : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => {
                onCategoryChange(cat.name);
                onSubcategoryChange('');
              }}
              className={`w-full text-left py-1 px-2 rounded-md transition-colors flex items-center justify-between ${
                selectedCategory.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-zinc-100 font-bold text-zinc-950'
                  : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-zinc-400 text-[11px]">{cat.productCount}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory (if category selected) */}
      {currentCategoryObj && currentCategoryObj.subcategories?.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2.5">Subcategory</h4>
          <div className="space-y-1 text-xs max-h-40 overflow-y-auto">
            <button
              type="button"
              onClick={() => onSubcategoryChange('')}
              className={`w-full text-left py-1 px-2 rounded-md transition-colors ${
                !selectedSubcategory ? 'bg-zinc-100 font-bold text-zinc-950' : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              All Subcategories
            </button>
            {currentCategoryObj.subcategories.map((subcat) => (
              <button
                key={subcat}
                type="button"
                onClick={() => onSubcategoryChange(subcat)}
                className={`w-full text-left py-1 px-2 rounded-md transition-colors ${
                  selectedSubcategory.toLowerCase() === subcat.toLowerCase()
                    ? 'bg-zinc-100 font-bold text-zinc-950'
                    : 'text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {subcat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2.5">Price Range (₹)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice || ''}
            onChange={(e) => onPriceChange(Number(e.target.value) || 0, maxPrice)}
            placeholder="Min"
            className="w-full text-xs p-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-900"
          />
          <span className="text-zinc-400 text-xs">to</span>
          <input
            type="number"
            value={maxPrice || ''}
            onChange={(e) => onPriceChange(minPrice, Number(e.target.value) || 0)}
            placeholder="Max"
            className="w-full text-xs p-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-900"
          />
        </div>
      </div>

      {/* Brand */}
      {brands.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2.5">Brand</h4>
          <div className="space-y-1 text-xs max-h-44 overflow-y-auto">
            <button
              type="button"
              onClick={() => onBrandChange('')}
              className={`w-full text-left py-1 px-2 rounded-md transition-colors ${
                !selectedBrand ? 'bg-zinc-100 font-bold text-zinc-950' : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              All Brands
            </button>
            {brands.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => onBrandChange(b)}
                className={`w-full text-left py-1 px-2 rounded-md transition-colors ${
                  selectedBrand.toLowerCase() === b.toLowerCase()
                    ? 'bg-zinc-100 font-bold text-zinc-950'
                    : 'text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Minimum Rating */}
      <div>
        <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2.5">Minimum Customer Rating</h4>
        <div className="space-y-1 text-xs">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRatingChange(selectedRating === r ? 0 : r)}
              className={`w-full text-left py-1 px-2 rounded-md transition-colors flex items-center justify-between ${
                selectedRating === r ? 'bg-zinc-100 font-bold text-zinc-950' : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <span>{r} Stars & Above</span>
              <span className="text-amber-500 font-bold">★ {r}.0+</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
