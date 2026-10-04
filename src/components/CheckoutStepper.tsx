import React from 'react';
import { Check } from 'lucide-react';

interface CheckoutStepperProps {
  currentStep: number; // 1: Address, 2: Delivery, 3: Payment, 4: Review
}

const steps = [
  { step: 1, label: 'Delivery Address' },
  { step: 2, label: 'Delivery Speed' },
  { step: 3, label: 'Payment Method' },
  { step: 4, label: 'Review & Confirm' },
];

export const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ currentStep }) => {
  return (
    <div className="w-full py-4 border-b border-zinc-200 bg-white mb-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-zinc-200 -z-0" />
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-zinc-950 transition-all duration-300 -z-0"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((item) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;

            return (
              <div key={item.step} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-zinc-950 text-white'
                      : isCurrent
                      ? 'bg-zinc-950 text-white ring-4 ring-zinc-200'
                      : 'bg-white border-2 border-zinc-300 text-zinc-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : item.step}
                </div>
                <span
                  className={`mt-2 text-xs font-semibold whitespace-nowrap hidden sm:block ${
                    isCurrent ? 'text-zinc-950' : isCompleted ? 'text-zinc-700' : 'text-zinc-400'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
