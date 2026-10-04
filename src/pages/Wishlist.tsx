import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/EmptyState';
import { RatingStars } from '../components/RatingStars';

export const Wishlist: React.FC = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Heart className="w-8 h-8 text-rose-500" />}
          title="Sign in to Access Your Wishlist"
          description="Keep track of your favorite products and editions across devices."
          actionText="Sign In"
          onAction={() => navigate('/login?redirect=/wishlist')}
        />
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Heart className="w-8 h-8 text-zinc-400" />}
          title="Your Wishlist is Empty"
          description="Click the heart icon on any product to save it to your personal wishlist."
          actionText="Browse Catalog"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  const handleMoveToCart = async (productId: string, defaultSku?: string) => {
    await addToCart(productId, defaultSku, 1);
    await toggleWishlist(productId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Saved Wishlist</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved to your account
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => {
          const mainImg = product.images?.[0]?.url || '';
          const defaultSku = product.variants?.[0]?.sku;

          return (
            <div
              key={product._id}
              className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="relative aspect-square bg-zinc-50 overflow-hidden">
                <Link to={`/products/${product.slug}`}>
                  <img src={mainImg} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </Link>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product._id)}
                  aria-label="Remove from wishlist"
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-sm hover:bg-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[11px] font-semibold text-zinc-600 uppercase">{product.brand}</span>
                  <Link to={`/products/${product.slug}`} className="block">
                    <h3 className="font-semibold text-xs text-zinc-900 line-clamp-2 hover:text-zinc-700 mt-0.5">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="mt-2">
                    <RatingStars rating={product.rating} count={product.reviewCount} />
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <div className="font-bold text-sm text-zinc-950">
                    ₹{product.pricing.price.toLocaleString()}
                  </div>

                  <button
                    type="button"
                    disabled={product.stock <= 0}
                    onClick={() => handleMoveToCart(product._id, defaultSku)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-950 text-white font-semibold text-xs hover:bg-zinc-800 disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
