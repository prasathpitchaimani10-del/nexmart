import React from 'react';
import { IVariant } from '../types';

interface VariantSelectorProps {
  variants: IVariant[];
  selectedSku: string;
  onSelectVariant: (variant: IVariant) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedSku,
  onSelectVariant,
}) => {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-zinc-900 uppercase tracking-wider">Select Edition / Variant</span>
        <span className="text-zinc-500 font-medium">{variants.length} available</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {variants.map((variant) => {
          const isSelected = variant.sku === selectedSku;
          const isOutOfStock = variant.stock <= 0;

          return (
            <button
              key={variant.sku}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectVariant(variant)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm ring-1 ring-zinc-950'
                  : isOutOfStock
                  ? 'border-zinc-200 bg-zinc-50 opacity-50 cursor-not-allowed text-zinc-400'
                  : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-xs leading-snug">{variant.title}</div>
                <div className={`text-xs font-bold shrink-0 ${isSelected ? 'text-white' : 'text-zinc-950'}`}>
                  ₹{variant.price.toLocaleString()}
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className={isSelected ? 'text-zinc-300' : 'text-zinc-500'}>
                  {variant.size && `Size: ${variant.size}`}
                  {variant.color && `Color: ${variant.color}`}
                  {variant.capacity && `Capacity: ${variant.capacity}`}
                </span>
                <span className={`font-medium ${isOutOfStock ? 'text-rose-500' : isSelected ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  {isOutOfStock ? 'Out of Stock' : `${variant.stock} in stock`}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
