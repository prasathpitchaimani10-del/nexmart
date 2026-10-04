import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Trash2, ShoppingBag, Check, X, ArrowLeft } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { RatingStars } from '../components/RatingStars';
import { EmptyState } from '../components/EmptyState';

export const Compare: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (compareList.length < 2) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Layers className="w-8 h-8 text-zinc-400" />}
          title="Select Products to Compare"
          description="Add at least 2 products to see a side-by-side comparison of prices, technical specifications, and customer ratings."
          actionText="Browse Catalog"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  // Compile all unique specification keys across selected products
  const specKeysSet = new Set<string>();
  compareList.forEach((p) => {
    p.specifications?.forEach((s) => specKeysSet.add(s.key));
  });
  const specKeys = Array.from(specKeysSet);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <Link to="/products" className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
          </Link>
          <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Side-by-Side Product Comparison</h1>
        </div>

        <button
          type="button"
          onClick={clearCompare}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl border border-zinc-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="p-4 w-48 text-xs font-bold text-zinc-400 uppercase tracking-wider">Features</th>
              {compareList.map((product) => (
                <th key={product._id} className="p-4 w-64 min-w-[220px] align-top">
                  <div className="relative space-y-2">
                    <button
                      type="button"
                      onClick={() => removeFromCompare(product._id)}
                      className="absolute -top-1 -right-1 text-zinc-400 hover:text-rose-600"
                      aria-label="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <img
                      src={product.images?.[0]?.url}
                      alt={product.name}
                      className="w-24 h-24 rounded-xl object-cover bg-white border border-zinc-200 mx-auto"
                    />
                    <div className="text-xs font-bold text-zinc-900 line-clamp-2 text-center">
                      {product.name}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs">
            {/* Price Row */}
            <tr className="hover:bg-zinc-50/50">
              <td className="p-4 font-bold text-zinc-700">Price</td>
              {compareList.map((p) => (
                <td key={p._id} className="p-4">
                  <div className="font-extrabold text-sm text-zinc-950">₹{p.pricing.price.toLocaleString()}</div>
                  {p.pricing.originalPrice > p.pricing.price && (
                    <div className="text-[11px] text-zinc-400 line-through">₹{p.pricing.originalPrice.toLocaleString()}</div>
                  )}
                </td>
              ))}
            </tr>

            {/* Rating Row */}
            <tr className="hover:bg-zinc-50/50">
              <td className="p-4 font-bold text-zinc-700">Customer Rating</td>
              {compareList.map((p) => (
                <td key={p._id} className="p-4">
                  <RatingStars rating={p.rating} count={p.reviewCount} />
                </td>
              ))}
            </tr>

            {/* Brand Row */}
            <tr className="hover:bg-zinc-50/50">
              <td className="p-4 font-bold text-zinc-700">Brand</td>
              {compareList.map((p) => (
                <td key={p._id} className="p-4 font-semibold text-zinc-900">{p.brand}</td>
              ))}
            </tr>

            {/* Category Row */}
            <tr className="hover:bg-zinc-50/50">
              <td className="p-4 font-bold text-zinc-700">Category</td>
              {compareList.map((p) => (
                <td key={p._id} className="p-4 text-zinc-600">{p.category}</td>
              ))}
            </tr>

            {/* Stock Availability */}
            <tr className="hover:bg-zinc-50/50">
              <td className="p-4 font-bold text-zinc-700">Availability</td>
              {compareList.map((p) => (
                <td key={p._id} className="p-4">
                  {p.stock > 0 ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> In Stock ({p.stock})
                    </span>
                  ) : (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <X className="w-3.5 h-3.5" /> Out of Stock
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Technical Specifications */}
            {specKeys.map((key) => (
              <tr key={key} className="hover:bg-zinc-50/50">
                <td className="p-4 font-semibold text-zinc-600">{key}</td>
                {compareList.map((p) => {
                  const spec = p.specifications?.find((s) => s.key.toLowerCase() === key.toLowerCase());
                  return (
                    <td key={p._id} className="p-4 text-zinc-800">
                      {spec ? spec.value : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Action CTAs */}
            <tr className="bg-zinc-50/70">
              <td className="p-4 font-bold text-zinc-700">Purchase</td>
              {compareList.map((p) => (
                <td key={p._id} className="p-4">
                  <button
                    type="button"
                    disabled={p.stock <= 0}
                    onClick={() => addToCart(p._id, p.variants?.[0]?.sku, 1)}
                    className="w-full py-2 rounded-lg bg-zinc-950 text-white font-semibold text-xs hover:bg-zinc-800 disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
