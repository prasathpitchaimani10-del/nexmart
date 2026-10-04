import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check, Layers } from 'lucide-react';
import { IProduct } from '../types';
import { RatingStars } from './RatingStars';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';

interface ProductCardProps {
  product: IProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare } = useCompare();

  const isWishlisted = isInWishlist(product._id);
  const isCompared = isInCompare(product._id);
  const isOutOfStock = product.stock <= 0;

  const mainImage =
    product.images?.find((img) => img.isMain)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';

  const hasDiscount =
    product.pricing.originalPrice && product.pricing.originalPrice > product.pricing.price;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    const defaultVariant = product.variants?.[0]?.sku;
    await addToCart(product._id, defaultVariant, 1);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCompare(product);
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-zinc-50 overflow-hidden">
        <Link to={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={mainImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/90 text-zinc-600 hover:text-zinc-950 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Compare Toggle */}
        <button
          type="button"
          onClick={handleCompareClick}
          aria-label="Compare product"
          className={`absolute bottom-2.5 left-2.5 px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 shadow-sm transition-colors ${
            isCompared
              ? 'bg-zinc-900 text-white'
              : 'bg-white/90 text-zinc-700 hover:bg-white'
          }`}
        >
          {isCompared ? <Check className="w-3 h-3 text-emerald-400" /> : <Layers className="w-3 h-3" />}
          <span>{isCompared ? 'Comparing' : 'Compare'}</span>
        </button>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-white px-2.5 py-1 rounded border border-rose-200 shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata line: brand · category */}
          <div className="text-xs text-zinc-600 flex items-center gap-1.5 mb-1">
            <span>{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.category}</span>
          </div>

          {/* Product Title */}
          <Link to={`/products/${product.slug}`} className="block">
            <h3 className="font-semibold text-zinc-900 text-sm line-clamp-2 hover:text-zinc-700 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mt-2">
            <RatingStars rating={product.rating} count={product.reviewCount} />
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-zinc-950">
                ₹{product.pricing.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs text-zinc-600 line-through">
                  ₹{product.pricing.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-[11px] font-semibold text-emerald-700">
                {product.pricing.discountPercentage}% off
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleQuickAdd}
            aria-label="Add to cart"
            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
              isOutOfStock
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                : 'bg-zinc-950 text-white hover:bg-zinc-800 active:scale-95'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
