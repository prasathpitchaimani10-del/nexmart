import React, { useState, useEffect } from 'react';
import { Star, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { IReview } from '../../types';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { RatingStars } from '../../components/RatingStars';
import { useToast } from '../../context/ToastContext';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { success, error: toastError } = useToast();

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await api.adminGetReviews();
      setReviews(res.reviews || []);
    } catch (err: any) {
      toastError(err.message || 'Failed to load reviews.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.adminDeleteReview(deletingId);
      setReviews((prev) => prev.filter((r) => r._id !== deletingId));
      success('Review removed.');
      setDeletingId(null);
    } catch (err: any) {
      toastError(err.message || 'Deletion failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-200">
        <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Customer Review Moderation</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Audit verified purchase feedback, ratings, and remove non-compliant content.</p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 divide-y divide-zinc-100 overflow-hidden shadow-xs">
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">No customer reviews to display.</div>
        ) : (
          reviews.map((rev) => (
            <div key={rev._id} className="p-5 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <RatingStars rating={rev.rating} />
                  <span className="font-bold text-xs text-zinc-900">{rev.title}</span>
                  {rev.verifiedPurchase && (
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-600 max-w-2xl leading-relaxed">{rev.comment}</p>

                <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                  <span>Author: {rev.userName}</span>
                  <span>·</span>
                  <span>Date: {new Date(rev.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>Product ID: {rev.productId}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeletingId(rev._id)}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg shrink-0 transition-colors"
                title="Moderate / Delete Review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <ConfirmationDialog
        isOpen={Boolean(deletingId)}
        title="Remove Review?"
        message="Are you sure you want to moderate and permanently delete this review? The product average rating will automatically be recalculated."
        confirmText="Delete Review"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
