import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  count?: number;
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  count,
  interactive = false,
  onRatingChange,
  size = 'sm',
}) => {
  const iconSize = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <div className="inline-flex items-center gap-1.5" aria-label={`Rating ${rating} out of 5`}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const half = !filled && rating >= star - 0.5;

          return (
            <button
              key={star}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={() => interactive && onRatingChange && onRatingChange(star)}
              className={`p-0.5 transition-transform ${
                interactive ? 'cursor-pointer hover:scale-110 focus:outline-none' : 'cursor-default pointer-events-none'
              }`}
            >
              <Star
                className={`${iconSize} ${
                  filled
                    ? 'text-amber-400 fill-amber-400'
                    : half
                    ? 'text-amber-400 fill-amber-400/50'
                    : 'text-zinc-300 dark:text-zinc-600'
                }`}
              />
            </button>
          );
        })}
      </div>
      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">({count.toLocaleString()})</span>
      )}
    </div>
  );
};
