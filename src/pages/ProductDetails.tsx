import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Layers,
  MapPin,
  Play,
  MessageSquare,
  Star,
  Send,
} from 'lucide-react';
import { api } from '../services/api';
import { IProduct, IVariant, IReview, IQuestion } from '../types';
import { RatingStars } from '../components/RatingStars';
import { VariantSelector } from '../components/VariantSelector';
import { ReviewCard } from '../components/ReviewCard';
import { QuestionCard } from '../components/QuestionCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare } = useCompare();
  const { isAuthenticated, user } = useAuth();
  const { success, error: toastError } = useToast();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<IVariant | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'video'>('photos');
  const [isLoading, setIsLoading] = useState(true);

  // Delivery check state
  const [pincode, setPincode] = useState('560038');
  const [pincodeResult, setPincodeResult] = useState<any>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

  // Review & Question form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      try {
        setIsLoading(true);
        const res = await api.getProductBySlug(slug);
        setProduct(res.product);
        setReviews(res.reviews || []);
        setQuestions(res.questions || []);

        if (res.product?.variants?.length > 0) {
          setSelectedVariant(res.product.variants[0]);
        }
      } catch (err: any) {
        toastError(err.message || 'Product not found.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  // Initial delivery check for default pincode
  useEffect(() => {
    const checkDefaultPin = async () => {
      try {
        const res = await api.checkDeliveryAvailability('560038');
        setPincodeResult(res);
      } catch {
        // ignore
      }
    };
    checkDefaultPin();
  }, []);

  const handlePincodeCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim()) return;
    setIsCheckingPincode(true);
    try {
      const res = await api.checkDeliveryAvailability(pincode.trim());
      setPincodeResult(res);
    } catch (err: any) {
      toastError(err.message || 'Pincode validation failed.');
    } finally {
      setIsCheckingPincode(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product._id, selectedVariant?.sku, quantity);
    } catch {
      // error toast handled in context
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toastError('Please sign in to proceed with direct checkout.');
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    // Navigate straight to checkout with this single product item
    navigate('/checkout', {
      state: {
        buyNowItem: {
          productId: product._id,
          variantSku: selectedVariant?.sku,
          quantity,
        },
      },
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !isAuthenticated) {
      toastError('Please log in to submit a verified review.');
      return;
    }
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      toastError('Please provide both title and review comments.');
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await api.createReview({
        productId: product._id,
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });
      setReviews((prev) => [res.review, ...prev]);
      setShowReviewForm(false);
      setReviewTitle('');
      setReviewComment('');
      success('Thank you! Your verified review has been published.');
    } catch (err: any) {
      toastError(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !isAuthenticated) {
      toastError('Please log in to ask a question.');
      return;
    }
    if (!newQuestion.trim()) return;
    setIsSubmittingQuestion(true);
    try {
      const res = await api.askQuestion(product._id, newQuestion.trim());
      setQuestions((prev) => [res.question, ...prev]);
      setNewQuestion('');
      success('Question submitted! It will appear with verified answer shortly.');
    } catch (err: any) {
      toastError(err.message || 'Failed to submit question.');
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  if (isLoading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8">
        <div className="h-6 bg-zinc-200 rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-zinc-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-zinc-200 rounded w-3/4" />
            <div className="h-6 bg-zinc-200 rounded w-1/3" />
            <div className="h-24 bg-zinc-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.pricing.price;
  const currentOriginalPrice = selectedVariant
    ? selectedVariant.originalPrice
    : product.pricing.originalPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;

  const discountPercentage =
    currentOriginalPrice && currentOriginalPrice > currentPrice
      ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
      : 0;

  const isWishlisted = isInWishlist(product._id);
  const isCompared = isInCompare(product._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-600 flex items-center gap-2">
        <Link to="/" className="hover:text-zinc-900 transition-colors">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-zinc-900 transition-colors">
          {product.category}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-zinc-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Gallery / Media Section */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-200 shadow-sm">
            {activeMediaTab === 'photos' ? (
              <img
                src={product.images?.[activeImageIndex]?.url || product.images?.[0]?.url}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            ) : product.video ? (
              <video
                src={product.video}
                controls
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            ) : null}

            {/* Quick Actions overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => toggleWishlist(product._id)}
                aria-label="Toggle wishlist"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-md ${
                  isWishlisted
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-white text-zinc-700 hover:text-zinc-950'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => addToCompare(product)}
                aria-label="Toggle compare"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-md ${
                  isCompared
                    ? 'bg-zinc-950 text-white'
                    : 'bg-white text-zinc-700 hover:text-zinc-950'
                }`}
              >
                {isCompared ? <Check className="w-4 h-4 text-emerald-400" /> : <Layers className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Media Tabs & Thumbnails */}
          <div className="flex items-center gap-3">
            {product.images?.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveMediaTab('photos');
                  setActiveImageIndex(idx);
                }}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  activeMediaTab === 'photos' && activeImageIndex === idx
                    ? 'border-zinc-950 ring-2 ring-zinc-200'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <img src={img.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}

            {product.video && (
              <button
                type="button"
                onClick={() => setActiveMediaTab('video')}
                className={`w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center bg-zinc-900 text-white transition-all shrink-0 ${
                  activeMediaTab === 'video'
                    ? 'border-zinc-950 ring-2 ring-zinc-200'
                    : 'border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                <Play className="w-5 h-5 fill-white" />
                <span className="text-[10px] font-bold mt-1">Video</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Info & Purchase Panel */}
        <div className="space-y-6">
          <div>
            <div className="text-xs text-zinc-600 flex items-center gap-2 mb-2 font-medium">
              <span>{product.brand}</span>
              <span aria-hidden="true">·</span>
              <span>SKU: {currentSku}</span>
              <span aria-hidden="true">·</span>
              <span className={currentStock > 0 ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-semibold'}>
                {currentStock > 0 ? `In Stock (${currentStock} left)` : 'Currently Out of Stock'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-4">
              <RatingStars rating={product.rating} count={product.reviewCount} size="md" />
              <span className="text-xs text-zinc-400">·</span>
              <a href="#reviews" className="text-xs font-semibold text-zinc-700 hover:underline">
                {reviews.length} Verified Customer Reviews
              </a>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-zinc-950">
                  ₹{currentPrice.toLocaleString()}
                </span>
                {discountPercentage > 0 && (
                  <span className="text-sm text-zinc-600 line-through">
                    ₹{currentOriginalPrice?.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                Inclusive of 18% standard GST. Free delivery on orders above ₹1,000.
              </div>
            </div>

            {discountPercentage > 0 && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded-lg">
                Save {discountPercentage}%
              </span>
            )}
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              selectedSku={selectedVariant?.sku || ''}
              onSelectVariant={(v) => setSelectedVariant(v)}
            />
          )}

          {/* Quantity Controls & CTA Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-zinc-200 rounded-xl bg-white p-1">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-sm font-bold text-zinc-600 hover:bg-zinc-100 rounded-lg disabled:opacity-40"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-xs text-zinc-900">{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= currentStock}
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  className="w-8 h-8 flex items-center justify-center text-sm font-bold text-zinc-600 hover:bg-zinc-100 rounded-lg disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={currentStock <= 0}
                  onClick={handleAddToCart}
                  className="py-3 px-4 rounded-xl bg-white border-2 border-zinc-950 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-zinc-50 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  disabled={currentStock <= 0}
                  onClick={handleBuyNow}
                  className="py-3 px-4 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Availability Check */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-wider">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Check Delivery Pincode</span>
            </div>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit Pincode"
                className="flex-1 text-xs p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
              <button
                type="submit"
                disabled={isCheckingPincode}
                className="px-4 py-2 bg-zinc-950 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 disabled:opacity-50"
              >
                {isCheckingPincode ? 'Checking...' : 'Check'}
              </button>
            </form>

            {pincodeResult && pincodeResult.serviceable ? (
              <div className="text-xs text-zinc-600 space-y-1 pt-1">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <Check className="w-4 h-4" />
                  <span>Serviceable to {pincodeResult.pincode}</span>
                </div>
                <div>Standard Delivery: <span className="font-semibold text-zinc-900">{pincodeResult.standardDelivery?.estimatedDate}</span></div>
                <div>Priority Express: <span className="font-semibold text-zinc-900">{pincodeResult.expressDelivery?.estimatedDate}</span> ({pincodeResult.expressDelivery?.fee})</div>
                <div className="text-[11px] text-zinc-400">Cash on Delivery available for this location.</div>
              </div>
            ) : pincodeResult ? (
              <div className="text-xs text-rose-600 font-medium">
                {pincodeResult.message || 'Delivery not serviceable to this location.'}
              </div>
            ) : null}
          </div>

          {/* Value Highlights */}
          <div className="grid grid-cols-2 gap-3 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>2-Year Official Brand Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-sky-600 shrink-0" />
              <span>7-Day Replacement Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Overview */}
      <div className="border-t border-zinc-200 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-950 tracking-tight mb-3">Product Overview</h3>
            <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {product.specifications && product.specifications.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-zinc-950 tracking-tight mb-4">Technical Specifications</h3>
              <div className="rounded-xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100 text-xs">
                {product.specifications.map((spec, idx) => (
                  <div key={idx} className="grid grid-cols-3 p-3 hover:bg-zinc-50 transition-colors">
                    <span className="font-semibold text-zinc-600">{spec.key}</span>
                    <span className="col-span-2 font-medium text-zinc-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Brand Kicker Card */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 space-y-4 h-fit">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-600">Manufactured & Guaranteed By</div>
          <div className="text-lg font-bold text-zinc-900">{product.brand}</div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Every unit passes strict quality control standards with serialized authenticity verification prior to dispatch from our central logistics hub.
          </p>
        </div>
      </div>

      {/* Verified Customer Reviews Section */}
      <div id="reviews" className="border-t border-zinc-200 pt-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Verified Customer Reviews</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Real feedback verified by backend purchase validation.</p>
          </div>

          <button
            type="button"
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 rounded-lg bg-zinc-950 text-white font-semibold text-xs hover:bg-zinc-800 transition-colors"
          >
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>

        {/* Review Form Drawer */}
        {showReviewForm && (
          <form
            onSubmit={handleReviewSubmit}
            className="p-5 rounded-xl border border-zinc-200 bg-zinc-50 space-y-4 max-w-xl animate-in fade-in"
          >
            <h4 className="font-bold text-sm text-zinc-900">Share Your Experience</h4>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Your Rating</label>
              <RatingStars
                rating={reviewRating}
                interactive
                onRatingChange={(r) => setReviewRating(r)}
                size="md"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Review Headline</label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="e.g. Excellent sound clarity and battery life"
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:border-zinc-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Detailed Review</label>
              <textarea
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share specific aspects like build quality, performance, ease of use..."
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:border-zinc-950"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-4 py-2 rounded-lg bg-zinc-950 text-white font-semibold text-xs hover:bg-zinc-800 disabled:opacity-50"
            >
              {isSubmittingReview ? 'Submitting...' : 'Publish Verified Review'}
            </button>
          </form>
        )}

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="p-8 text-center bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-500">
              No reviews published for this product yet. Be the first customer to leave feedback!
            </div>
          ) : (
            reviews.map((rev) => <ReviewCard key={rev._id} review={rev} />)
          )}
        </div>
      </div>

      {/* Questions & Answers Section */}
      <div className="border-t border-zinc-200 pt-10 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Questions & Answers</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Got inquiries about this product? Inquire directly with verified answers.</p>
        </div>

        <form onSubmit={handleQuestionSubmit} className="flex gap-2 max-w-xl">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ask a technical or compatibility question..."
            className="flex-1 text-xs p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950 bg-white"
          />
          <button
            type="submit"
            disabled={isSubmittingQuestion || !newQuestion.trim()}
            className="px-4 py-2 rounded-lg bg-zinc-950 text-white font-semibold text-xs hover:bg-zinc-800 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>

        <div className="space-y-3">
          {questions.length === 0 ? (
            <div className="p-8 text-center bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-500">
              No customer questions asked yet for this item.
            </div>
          ) : (
            questions.map((q) => <QuestionCard key={q._id} question={q} />)
          )}
        </div>
      </div>
    </div>
  );
};
