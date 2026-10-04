import React, { useState, useEffect } from 'react';
import { Plus, Tag, Edit2, Check, X } from 'lucide-react';
import { api } from '../../services/api';
import { ICoupon } from '../../types';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number | ''>('');
  const [minPurchase, setMinPurchase] = useState<number | ''>('');
  const [maxDiscount, setMaxDiscount] = useState<number | ''>('');
  const [usageLimit, setUsageLimit] = useState<number | ''>(500);
  const [expiresAt, setExpiresAt] = useState('2027-12-31');

  const { success, error: toastError } = useToast();

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const res = await api.adminGetCoupons();
      setCoupons(res.coupons || []);
    } catch (err: any) {
      toastError(err.message || 'Failed to load coupons.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue(15);
    setMinPurchase(1000);
    setMaxDiscount(1500);
    setUsageLimit(500);
    setExpiresAt('2027-12-31');
    setIsModalOpen(true);
  };

  const openEditModal = (c: ICoupon) => {
    setEditingId(c._id);
    setCode(c.code);
    setDescription(c.description);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue);
    setMinPurchase(c.minPurchase);
    setMaxDiscount(c.maxDiscount);
    setUsageLimit(c.usageLimit);
    setExpiresAt(new Date(c.expiresAt).toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !description || discountValue === '') return;

    const payload = {
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      minPurchase: Number(minPurchase) || 0,
      maxDiscount: Number(maxDiscount) || 0,
      usageLimit: Number(usageLimit) || 1000,
      expiresAt: new Date(expiresAt).toISOString(),
    };

    try {
      if (editingId) {
        await api.adminUpdateCoupon(editingId, payload);
        success('Coupon updated successfully.');
      } else {
        await api.adminCreateCoupon(payload);
        success('Coupon generated successfully.');
      }
      setIsModalOpen(false);
      await fetchCoupons();
    } catch (err: any) {
      toastError(err.message || 'Operation failed.');
    }
  };

  const handleToggleActive = async (c: ICoupon) => {
    try {
      await api.adminUpdateCoupon(c._id, { isActive: !c.isActive });
      setCoupons((prev) => prev.map((item) => (item._id === c._id ? { ...item, isActive: !c.isActive } : item)));
      success(`Coupon ${!c.isActive ? 'activated' : 'deactivated'}.`);
    } catch (err: any) {
      toastError(err.message || 'Failed to toggle status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Promotions & Discount Coupons</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Define cart vouchers, percentage discounts, minimum basket limits, and caps.</p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div key={c._id} className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-extrabold text-base text-zinc-900 px-3 py-1 rounded-lg bg-zinc-100 border border-zinc-200">
                {c.code}
              </span>
              <button
                type="button"
                onClick={() => handleToggleActive(c)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  c.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                }`}
              >
                {c.isActive ? 'Active' : 'Disabled'}
              </button>
            </div>

            <p className="text-xs text-zinc-600 leading-snug">{c.description}</p>

            <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-500 space-y-1">
              <div className="flex justify-between">
                <span>Benefit:</span>
                <strong className="text-zinc-900">
                  {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Flat Off`}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Min Cart Purchase:</span>
                <span className="text-zinc-800 font-medium">₹{c.minPurchase.toLocaleString()}</span>
              </div>
              {c.maxDiscount > 0 && (
                <div className="flex justify-between">
                  <span>Max Discount Cap:</span>
                  <span className="text-zinc-800 font-medium">₹{c.maxDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Usage Progress:</span>
                <span className="text-zinc-800 font-medium">{c.usedCount} / {c.usageLimit}</span>
              </div>
              <div className="flex justify-between">
                <span>Expires:</span>
                <span className="text-zinc-800 font-medium">{new Date(c.expiresAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex justify-end">
              <button
                type="button"
                onClick={() => openEditModal(c)}
                className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Configuration
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Promo Coupon' : 'Create New Promo Coupon'}
      >
        <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. FLASH25"
                className="w-full p-2.5 rounded-lg border border-zinc-200 uppercase font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Discount Type *</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-zinc-200 bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Rupee Amount (₹)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Description / Customer Label *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 15% instant savings on orders above ₹1,000"
              className="w-full p-2.5 rounded-lg border border-zinc-200"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Discount Value *</label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value) || '')}
                placeholder="15"
                className="w-full p-2.5 rounded-lg border border-zinc-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Min Purchase (₹)</label>
              <input
                type="number"
                value={minPurchase}
                onChange={(e) => setMinPurchase(Number(e.target.value) || '')}
                placeholder="1000"
                className="w-full p-2.5 rounded-lg border border-zinc-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Max Discount Cap (₹)</label>
              <input
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(Number(e.target.value) || '')}
                placeholder="1500"
                className="w-full p-2.5 rounded-lg border border-zinc-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Usage Limit</label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(Number(e.target.value) || '')}
                className="w-full p-2.5 rounded-lg border border-zinc-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Expiration Date</label>
              <input
                type="date"
                required
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-zinc-200"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-zinc-950 text-white font-semibold hover:bg-zinc-800"
            >
              Save Coupon
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
