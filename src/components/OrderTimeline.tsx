import React from 'react';
import { CheckCircle2, Clock, Truck, Package, AlertCircle } from 'lucide-react';
import { ITrackingEvent, OrderStatus } from '../types';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  history: ITrackingEvent[];
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ currentStatus, history }) => {
  const isCancelled = currentStatus === 'cancelled';

  const stages: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
    { key: 'confirmed', label: 'Order Confirmed', icon: <CheckCircle2 className="w-4 h-4" /> },
    { key: 'processing', label: 'Processing & Packed', icon: <Package className="w-4 h-4" /> },
    { key: 'shipped', label: 'In Transit / Shipped', icon: <Truck className="w-4 h-4" /> },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: <Clock className="w-4 h-4" /> },
    { key: 'delivered', label: 'Delivered', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const getStageIndex = (status: string) => {
    if (status === 'confirmed') return 0;
    if (status === 'processing') return 1;
    if (status === 'shipped') return 2;
    if (status === 'out_for_delivery') return 3;
    if (status === 'delivered') return 4;
    return -1;
  };

  const currentIndex = getStageIndex(currentStatus);

  return (
    <div className="space-y-6">
      {/* Visual Horizontal Tracker */}
      {!isCancelled ? (
        <div className="bg-white p-5 rounded-xl border border-zinc-200">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-zinc-200 -z-0" />
            <div
              className="absolute top-1/2 left-4 -translate-y-1/2 h-0.5 bg-emerald-600 transition-all duration-300 -z-0"
              style={{
                width: `${currentIndex >= 0 ? (currentIndex / (stages.length - 1)) * 100 : 0}%`,
              }}
            />

            {stages.map((stage, idx) => {
              const isPast = currentIndex >= idx;
              const isCurrent = currentIndex === idx;

              return (
                <div key={stage.key} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                      isPast
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white border-2 border-zinc-300 text-zinc-400'
                    }`}
                  >
                    {stage.icon}
                  </div>
                  <span
                    className={`mt-2 text-[11px] font-semibold text-center hidden md:block ${
                      isCurrent ? 'text-zinc-950 font-bold' : isPast ? 'text-zinc-700' : 'text-zinc-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <div>
            <span className="font-bold">This order was cancelled.</span> Restocking and refund protocols have been
            executed.
          </div>
        </div>
      )}

      {/* History Log Timeline */}
      <div className="bg-white p-5 rounded-xl border border-zinc-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-4">Milestone History</h4>
        <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
          {history.map((event, idx) => (
            <div key={idx} className="relative flex items-start gap-4 pl-8">
              <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-zinc-900" />
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-900 uppercase tracking-wide">
                    {event.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-zinc-400 text-[11px]">
                    {new Date(event.timestamp).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 mt-0.5">{event.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
