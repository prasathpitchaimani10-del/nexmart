import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Tag, ShieldCheck, Zap, Award } from 'lucide-react';
import { api } from '../services/api';
import { IProduct, ICategory } from '../types';
import { ProductCard } from '../components/ProductCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<IProduct[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success } = useToast();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        const [featuredRes, trendingRes, categoriesRes] = await Promise.all([
          api.getProducts({ featured: true, limit: 4 }),
          api.getProducts({ trending: true, limit: 4 }),
          api.getCategories(),
        ]);
        setFeaturedProducts(featuredRes || []);
        setTrendingProducts(trendingRes || []);
        setCategories(categoriesRes.categories || []);
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    success(`Coupon code ${code} copied to clipboard!`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-zinc-950 text-white overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>2026 Studio Flagship Release</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Architected for performance. Built for life.
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
                Discover engineered studio audio, carbon ultrabooks, tailored mercerized apparel, and culinary-grade cookware. Fully verified inventory with express same-day dispatch.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/products"
                  className="px-6 py-3 rounded-xl bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-zinc-100 transition-colors shadow-lg shadow-white/5 flex items-center gap-2"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/category/electronics"
                  className="px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 transition-colors"
                >
                  Audio & Gadgets
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-4/3 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"
                  alt="AcousticPro Studio Headphones"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-4 rounded-xl shadow-xl hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Audiophile Choice 2026</div>
                  <div className="text-[11px] text-zinc-400">45-Hour Battery Life · Hybrid ANC</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Rail */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Curated Categories</h2>
            <p className="text-xs text-zinc-500 mt-1">Browse high-performance gear sorted by discipline.</p>
          </div>
          <Link to="/products" className="text-xs font-semibold text-zinc-900 hover:text-zinc-600 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              className="group relative h-48 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-bold text-base leading-snug">{cat.name}</h3>
                <span className="text-[11px] text-zinc-300 font-medium">
                  {cat.productCount} Products available
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1">Editor Selection</div>
            <h2 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Featured Gear</h2>
          </div>
          <Link to="/products?featured=true" className="text-xs font-semibold text-zinc-900 hover:text-zinc-600 flex items-center gap-1">
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <LoadingSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotion Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 sm:p-10 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Zap className="w-4 h-4" /> Instant Coupon Savings
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Enjoy 20% off your order with code FESTIVE20
            </h3>
            <p className="text-xs text-zinc-400">
              Valid on all flagship electronics, fashion, and home appliances. Calculated automatically during checkout.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-700 font-mono font-bold text-base text-amber-300 select-all">
              FESTIVE20
            </div>
            <button
              type="button"
              onClick={() => handleCopyCoupon('FESTIVE20')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
            >
              Copy Code
            </button>
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1">High Demand</div>
            <h2 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Trending Across Stores</h2>
          </div>
          <Link to="/products?trending=true" className="text-xs font-semibold text-zinc-900 hover:text-zinc-600 flex items-center gap-1">
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <LoadingSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
