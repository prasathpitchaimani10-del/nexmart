import React from 'react';
import { HelpCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { IQuestion } from '../types';

export const QuestionCard: React.FC<{ question: IQuestion }> = ({ question }) => {
  return (
    <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3">
      <div className="flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-xs font-bold text-zinc-900 leading-snug">{question.question}</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Asked by {question.userName} · {new Date(question.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {question.answer ? (
        <div className="flex items-start gap-2.5 pl-6 pt-2 border-t border-zinc-100">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-xs text-zinc-700 leading-relaxed">{question.answer}</div>
            <div className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{question.answeredBy || 'NexMart Support'}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="pl-6 text-xs text-zinc-400 italic">Awaiting merchant verification.</div>
      )}
    </div>
  );
};
