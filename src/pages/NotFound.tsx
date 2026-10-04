import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowRight } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-500 flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">404 - Page Not Found</h1>
      <p className="text-xs text-zinc-500 max-w-sm mt-2 leading-relaxed">
        The product, category, or administrative resource you requested does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 transition-colors shadow-sm inline-flex items-center gap-2"
      >
        <span>Return to Home Catalog</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
