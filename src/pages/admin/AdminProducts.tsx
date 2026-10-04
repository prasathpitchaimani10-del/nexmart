import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Layers, Package } from 'lucide-react';
import { api } from '../../services/api';
import { IProduct } from '../../types';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { useToast } from '../../context/ToastContext';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { success, error: toastError } = useToast();

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await api.getProducts({ activeOnly: false, search: search.trim() || undefined, limit: 100 });
      setProducts(res || []);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch products.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleToggleActive = async (product: IProduct) => {
    try {
      const updated = await api.adminUpdateProduct(product._id, { isActive: !product.isActive });
      setProducts((prev) => prev.map((p) => (p._id === product._id ? updated.product : p)));
      success(`Product "${product.name.slice(0, 16)}..." ${updated.product.isActive ? 'activated' : 'deactivated'}.`);
    } catch (err: any) {
      toastError(err.message || 'Status update failed.');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.adminDeleteProduct(deletingId);
      setProducts((prev) => prev.filter((p) => p._id !== deletingId));
      success('Product deleted permanently.');
      setDeletingId(null);
    } catch (err: any) {
      toastError(err.message || 'Deletion failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Product Catalog Management</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage SKU identifiers, tiered variants, pricing, and active display state.</p>
        </div>

        <Link
          to="/admin/products/new"
          className="px-4 py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Product</span>
        </Link>
      </div>

      {/* Search Filter Bar */}
      <div className="max-w-md">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, SKU, or brand..."
            className="w-full text-xs p-2.5 pl-9 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:border-zinc-950 shadow-xs"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="p-4">Product Info</th>
                <th className="p-4">Category</th>
                <th className="p-4">Base SKU</th>
                <th className="p-4">Price</th>
                <th className="p-4">Inventory</th>
                <th className="p-4">Variants</th>
                <th className="p-4">State</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-400">
                    No products found matching query.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const mainImg = p.images?.[0]?.url || '';
                  const variantCount = p.variants?.length || 0;

                  return (
                    <tr key={p._id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={mainImg} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-zinc-50 border border-zinc-200 shrink-0" />
                          <div>
                            <div className="font-bold text-zinc-900 line-clamp-1">{p.name}</div>
                            <div className="text-[11px] text-zinc-400">{p.brand}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-zinc-600">
                        {p.category}
                        <div className="text-[10px] text-zinc-400">{p.subcategory}</div>
                      </td>

                      <td className="p-4 font-mono font-semibold text-zinc-800">{p.sku}</td>

                      <td className="p-4 font-bold text-zinc-950">₹{p.pricing.price.toLocaleString()}</td>

                      <td className="p-4">
                        <span
                          className={`font-semibold ${
                            p.stock <= 5 ? 'text-rose-600' : p.stock <= 15 ? 'text-amber-600' : 'text-emerald-700'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-semibold text-[11px] border border-zinc-200">
                          {variantCount} Editions
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                            p.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                          }`}
                        >
                          {p.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{p.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/products/${p._id}/edit`}
                            className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
                            aria-label="Edit product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeletingId(p._id)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            aria-label="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={Boolean(deletingId)}
        title="Delete Product Permanently?"
        message="This action removes the product from the catalog, its variants, and specifications. It cannot be undone."
        confirmText="Delete Product"
        isDestructive
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
