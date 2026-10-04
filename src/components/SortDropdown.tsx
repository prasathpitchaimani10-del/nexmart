import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface SortDropdownProps {
  currentSort: string;
  onSortChange: (newSort: string) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ currentSort, onSortChange }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500 font-medium hidden sm:inline-block flex items-center gap-1">
        <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
      </span>
      <select
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
        className="bg-white border border-zinc-200 text-zinc-800 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-zinc-900 cursor-pointer shadow-sm"
      >
        <option value="relevance">Relevance & Match</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating">Highest Customer Rating</option>
        <option value="popularity">Most Popular & Reviewed</option>
        <option value="newest">Latest Arrivals</option>
      </select>
    </div>
  );
};
