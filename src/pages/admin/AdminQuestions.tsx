import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Send, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { IQuestion } from '../../types';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answeringQuestion, setAnsweringQuestion] = useState<IQuestion | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const res = await api.adminGetQuestions();
      setQuestions(res.questions || []);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch customer questions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handlePublishAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answeringQuestion || !answerText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.adminAnswerQuestion(answeringQuestion._id, answerText.trim());
      setQuestions((prev) =>
        prev.map((q) => (q._id === answeringQuestion._id ? res.question : q))
      );
      success('Verified answer published.');
      setAnsweringQuestion(null);
      setAnswerText('');
    } catch (err: any) {
      toastError(err.message || 'Failed to answer question.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-200">
        <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Customer Product Inquiries & Q&A</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Publish authoritative technical and warranty answers directly to the product page.</p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 divide-y divide-zinc-100 overflow-hidden shadow-xs">
        {questions.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">No customer questions currently logged.</div>
        ) : (
          questions.map((q) => (
            <div key={q._id} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-zinc-100 text-zinc-600 mt-0.5 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-zinc-950">{q.question}</h3>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Asked by {q.userName} · {new Date(q.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAnsweringQuestion(q);
                    setAnswerText(q.answer || '');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-950 text-white font-semibold text-xs hover:bg-zinc-800 transition-colors shrink-0"
                >
                  {q.answer ? 'Edit Answer' : 'Provide Answer'}
                </button>
              </div>

              {q.answer && (
                <div className="ml-11 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verified Response ({q.answeredBy || 'Support'})</span>
                  </div>
                  <p className="text-zinc-700 leading-relaxed">{q.answer}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Answer Modal */}
      {answeringQuestion && (
        <Modal
          isOpen={Boolean(answeringQuestion)}
          onClose={() => setAnsweringQuestion(null)}
          title="Publish Official Product Answer"
        >
          <form onSubmit={handlePublishAnswer} className="space-y-4 text-xs">
            <div className="p-3 bg-zinc-50 rounded-lg text-zinc-800">
              <span className="font-bold text-[11px] uppercase text-zinc-400 block mb-1">Customer Question</span>
              {answeringQuestion.question}
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Official Response Text</label>
              <textarea
                rows={4}
                required
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Provide accurate specifications or usage guidelines..."
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="pt-4 border-t border-zinc-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAnsweringQuestion(null)}
                className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-zinc-950 text-white font-semibold hover:bg-zinc-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Answer'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
