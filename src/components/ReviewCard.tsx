import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { IReview } from '../types';
import { RatingStars } from './RatingStars';

export const ReviewCard: React.FC<{ review: IReview }> = ({ review }) => {
  return (
    <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-zinc-900">{review.userName}</span>
            {review.verifiedPurchase && (
              <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Purchase
              </span>
            )}
          </div>
          <div className="mt-1">
            <RatingStars rating={review.rating} />
          </div>
        </div>

        <span className="text-[11px] text-zinc-400">
          {new Date(review.createdAt).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>

      <div>
        <h4 className="font-semibold text-xs text-zinc-900">{review.title}</h4>
        <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{review.comment}</p>
      </div>

      {review.photos && review.photos.length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          {review.photos.map((photo, i) => (
            <img
              key={i}
              src={photo}
              alt="Customer product photo"
              className="w-14 h-14 rounded-lg object-cover border border-zinc-200"
            />
          ))}
        </div>
      )}
    </div>
  );
};
