import React, { useState } from 'react';
import { Smartphone, CreditCard, Landmark, Wallet, Banknote, ShieldCheck } from 'lucide-react';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';

interface PaymentSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  orderTotal: number;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  orderTotal,
}) => {
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [selectedWallet, setSelectedWallet] = useState('Amazon Pay');
  const [cardHolder, setCardHolder] = useState('Rahul Sharma');
  const [cardLast4, setCardLast4] = useState('4242');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Select Payment Option</h3>
        <span className="text-xs text-emerald-700 flex items-center gap-1 font-semibold">
          <ShieldCheck className="w-4 h-4" /> 100% Sandbox Encrypted
        </span>
      </div>

      <div className="space-y-3">
        {/* UPI Option */}
        <div
          onClick={() => onMethodChange('upi')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedMethod === 'upi'
              ? 'border-zinc-950 bg-zinc-50/50 shadow-sm ring-1 ring-zinc-950'
              : 'border-zinc-200 bg-white hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900">
                <Smartphone className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-900">Instant UPI Payment</div>
                <div className="text-xs text-zinc-500">Google Pay, PhonePe, Paytm, BHIM UPI</div>
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              checked={selectedMethod === 'upi'}
              onChange={() => onMethodChange('upi')}
              className="w-4 h-4 text-zinc-950 focus:ring-zinc-950"
            />
          </div>

          {selectedMethod === 'upi' && (
            <div className="mt-4 pt-3 border-t border-zinc-200/80 space-y-3">
              <label className="block text-xs font-semibold text-zinc-700">Enter Virtual Payment Address (VPA / UPI ID)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@okhdfcbank"
                  className="flex-1 text-xs p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950 bg-white font-mono"
                />
                <span className="text-xs font-semibold px-3 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 flex items-center">
                  Verified UPI
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                A sandbox test payment request will be simulated and securely verified against the backend gateway.
              </p>
            </div>
          )}
        </div>

        {/* Credit / Debit Card Option */}
        <div
          onClick={() => onMethodChange('card')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedMethod === 'card'
              ? 'border-zinc-950 bg-zinc-50/50 shadow-sm ring-1 ring-zinc-950'
              : 'border-zinc-200 bg-white hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-900">Credit / Debit Card</div>
                <div className="text-xs text-zinc-500">Visa, MasterCard, RuPay, Maestro</div>
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              checked={selectedMethod === 'card'}
              onChange={() => onMethodChange('card')}
              className="w-4 h-4 text-zinc-950 focus:ring-zinc-950"
            />
          </div>

          {selectedMethod === 'card' && (
            <div className="mt-4 pt-3 border-t border-zinc-200/80 space-y-3">
              <div className="p-3 bg-zinc-100/80 rounded-lg text-xs text-zinc-600 border border-zinc-200">
                <span className="font-semibold text-zinc-900">Security Rule Active:</span> In strict accordance with PCI-DSS regulations, raw card numbers and CVVs are processed solely via payment tokenization and never stored on servers.
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Card Ending In</label>
                  <input
                    type="text"
                    readOnly
                    value={`•••• •••• •••• ${cardLast4}`}
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 bg-zinc-50 font-mono text-zinc-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Net Banking Option */}
        <div
          onClick={() => onMethodChange('netbanking')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedMethod === 'netbanking'
              ? 'border-zinc-950 bg-zinc-50/50 shadow-sm ring-1 ring-zinc-950'
              : 'border-zinc-200 bg-white hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900">
                <Landmark className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-900">Net Banking</div>
                <div className="text-xs text-zinc-500">All major Indian retail and corporate banks</div>
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              checked={selectedMethod === 'netbanking'}
              onChange={() => onMethodChange('netbanking')}
              className="w-4 h-4 text-zinc-950 focus:ring-zinc-950"
            />
          </div>

          {selectedMethod === 'netbanking' && (
            <div className="mt-4 pt-3 border-t border-zinc-200/80 space-y-2">
              <label className="block text-xs font-semibold text-zinc-700">Select Bank</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950 bg-white"
              >
                <option value="HDFC">HDFC Bank</option>
                <option value="ICICI">ICICI Bank</option>
                <option value="SBI">State Bank of India</option>
                <option value="AXIS">Axis Bank</option>
                <option value="KOTAK">Kotak Mahindra Bank</option>
              </select>
            </div>
          )}
        </div>

        {/* Wallets Option */}
        <div
          onClick={() => onMethodChange('wallet')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedMethod === 'wallet'
              ? 'border-zinc-950 bg-zinc-50/50 shadow-sm ring-1 ring-zinc-950'
              : 'border-zinc-200 bg-white hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900">
                <Wallet className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-900">Digital Wallets</div>
                <div className="text-xs text-zinc-500">Amazon Pay, Paytm Wallet, Mobikwik</div>
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              checked={selectedMethod === 'wallet'}
              onChange={() => onMethodChange('wallet')}
              className="w-4 h-4 text-zinc-950 focus:ring-zinc-950"
            />
          </div>

          {selectedMethod === 'wallet' && (
            <div className="mt-4 pt-3 border-t border-zinc-200/80 space-y-2">
              <label className="block text-xs font-semibold text-zinc-700">Select Digital Wallet</label>
              <select
                value={selectedWallet}
                onChange={(e) => setSelectedWallet(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950 bg-white"
              >
                <option value="Amazon Pay">Amazon Pay Balance</option>
                <option value="Paytm Wallet">Paytm Wallet</option>
                <option value="Mobikwik">Mobikwik Wallet</option>
              </select>
            </div>
          )}
        </div>

        {/* Cash on Delivery Option */}
        <div
          onClick={() => onMethodChange('cod')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedMethod === 'cod'
              ? 'border-zinc-950 bg-zinc-50/50 shadow-sm ring-1 ring-zinc-950'
              : 'border-zinc-200 bg-white hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900">
                <Banknote className="w-5 h-5 text-zinc-700" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-900">Cash on Delivery (COD)</div>
                <div className="text-xs text-zinc-500">Pay cash or UPI directly to the courier upon doorstep delivery</div>
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              checked={selectedMethod === 'cod'}
              onChange={() => onMethodChange('cod')}
              className="w-4 h-4 text-zinc-950 focus:ring-zinc-950"
            />
          </div>

          {selectedMethod === 'cod' && (
            <div className="mt-4 pt-3 border-t border-zinc-200/80">
              <p className="text-xs text-zinc-600">
                Please keep exact cash (₹{orderTotal.toLocaleString()}) or digital QR ready for the delivery agent at the time of delivery.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
