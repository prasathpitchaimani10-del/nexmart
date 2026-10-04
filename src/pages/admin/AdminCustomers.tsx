import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, CheckCircle, UserX, UserCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError } = useToast();

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await api.adminGetCustomers({ search: search.trim() || undefined });
      setCustomers(res || []);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch customer accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await api.adminToggleCustomerActive(id);
      setCustomers((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: !currentActive } : c))
      );
      success(`Customer account ${!currentActive ? 'activated' : 'deactivated'}.`);
    } catch (err: any) {
      toastError(err.message || 'Action failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-200">
        <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Customer Accounts & Governance</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Manage registered shopper accounts, review verification statuses, and toggle access.</p>
      </div>

      <div className="max-w-md">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, or phone..."
            className="w-full text-xs p-2.5 pl-9 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:border-zinc-950"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="p-4">Customer Details</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4">Verified</th>
                <th className="p-4">Account State</th>
                <th className="p-4">Member Since</th>
                <th className="p-4 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-400">
                    No customers found matching query.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-zinc-900">{c.name}</div>
                      <div className="text-[11px] text-zinc-400">{c.email}</div>
                    </td>

                    <td className="p-4 text-zinc-700">{c.phone || '—'}</td>

                    <td className="p-4">
                      <span className="capitalize font-semibold text-zinc-800">{c.role}</span>
                    </td>

                    <td className="p-4">
                      {c.isVerified ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-zinc-400 font-medium">Pending OTP</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {c.isActive !== false ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="p-4 text-zinc-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right">
                      {c.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => handleToggleActive(c._id, c.isActive !== false)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-auto ${
                            c.isActive !== false
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {c.isActive !== false ? (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
