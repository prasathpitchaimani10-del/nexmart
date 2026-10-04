import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, X, ArrowRight } from 'lucide-react';
import { useCompare } from '../context/CompareContext';

export const CompareBar: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  if (compareList.length === 0) return null;

  return (
    <aside aria-label="Product comparison bar" className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md text-white border-t border-zinc-800 shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300 shrink-0">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Comparing ({compareList.length}/4)</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {compareList.map((product) => (
              <div
                key={product._id}
                className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 shrink-0 max-w-[200px]"
              >
                <img
                  src={product.images?.[0]?.url}
                  alt={product.name}
                  className="w-6 h-6 rounded object-cover shrink-0"
                />
                <span className="text-xs text-zinc-200 truncate">{product.name}</span>
                <button
                  type="button"
                  onClick={() => removeFromCompare(product._id)}
                  aria-label={`Remove ${product.name} from comparison`}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={clearCompare}
            className="text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            disabled={compareList.length < 2}
            onClick={() => navigate('/compare')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors ${
              compareList.length >= 2
                ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
