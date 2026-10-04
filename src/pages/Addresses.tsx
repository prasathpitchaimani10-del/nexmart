import React, { useState, useEffect } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { IAddress } from '../types';
import { AddressCard } from '../components/AddressCard';
import { Modal } from '../components/Modal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Addresses: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    houseFlat: string;
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    addressType: 'home' | 'work' | 'other';
    isDefault: boolean;
  }>({
    name: user?.name || '',
    phone: user?.phone || '',
    houseFlat: '',
    street: '',
    area: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    addressType: 'home',
    isDefault: false,
  });

  // Delete dialog state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAddresses();
      setAddresses(res.addresses || []);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch addresses.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setEditingAddressId(null);
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      houseFlat: '',
      street: '',
      area: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      addressType: 'home',
      isDefault: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (addr: IAddress) => {
    setEditingAddressId(addr._id || null);
    setFormData({
      name: addr.name,
      phone: addr.phone,
      houseFlat: addr.houseFlat,
      street: addr.street,
      area: addr.area || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      addressType: addr.addressType,
      isDefault: addr.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        const res = await api.updateAddress(editingAddressId, formData);
        setAddresses(res.addresses);
        success('Address updated.');
      } else {
        const res = await api.addAddress(formData);
        setAddresses(res.addresses);
        success('New address added.');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toastError(err.message || 'Failed to save address.');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await api.deleteAddress(deletingId);
      setAddresses(res.addresses);
      success('Address removed.');
      setDeletingId(null);
    } catch (err: any) {
      toastError(err.message || 'Failed to delete address.');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await api.setDefaultAddress(id);
      setAddresses(res.addresses);
      success('Default address updated.');
    } catch (err: any) {
      toastError(err.message || 'Failed to update default address.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Delivery Addresses</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage residential and office shipping destinations.</p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl bg-zinc-950 text-white font-semibold text-xs hover:bg-zinc-800 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <AddressCard
            key={addr._id}
            address={addr}
            onEdit={() => openEditModal(addr)}
            onDelete={() => setDeletingId(addr._id || null)}
            onSetDefault={() => handleSetDefault(addr._id || '')}
            showActions
          />
        ))}
      </div>

      {/* Address Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddressId ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Contact Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Mobile Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">House / Flat / Suite</label>
            <input
              type="text"
              required
              value={formData.houseFlat}
              onChange={(e) => setFormData({ ...formData, houseFlat: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Street / Colony</label>
            <input
              type="text"
              required
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">State</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Pincode</label>
              <input
                type="text"
                required
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <span className="font-semibold text-zinc-700">Type:</span>
            {['home', 'work', 'other'].map((t) => (
              <label key={t} className="flex items-center gap-1.5 cursor-pointer capitalize">
                <input
                  type="radio"
                  name="type"
                  checked={formData.addressType === t}
                  onChange={() => setFormData({ ...formData, addressType: t as any })}
                  className="w-3.5 h-3.5 text-zinc-950"
                />
                <span>{t}</span>
              </label>
            ))}
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
              Save Address
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={Boolean(deletingId)}
        title="Remove Delivery Address?"
        message="Are you sure you want to delete this address from your account?"
        confirmText="Delete Address"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
