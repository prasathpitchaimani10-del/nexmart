import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Upload, Image as ImageIcon, Save } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminProductCreateEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [subcategory, setSubcategory] = useState('Audio & Headphones');
  const [brand, setBrand] = useState('NexMart Originals');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [video, setVideo] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);

  // Images list
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Specifications builder
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([
    { key: 'Material', value: 'Aerospace Grade Aluminum' },
    { key: 'Warranty', value: '2 Years Manufacturer' },
  ]);

  // Variants builder
  const [variants, setVariants] = useState<any[]>([
    {
      sku: 'PROD-V1',
      title: 'Standard Black Edition',
      color: 'Black',
      size: 'Standard',
      price: 9999,
      originalPrice: 12999,
      stock: 25,
    },
  ]);

  useEffect(() => {
    if (!isEditing || !id) return;
    const fetchExistingProduct = async () => {
      try {
        setIsLoading(true);
        const res = await api.getProductBySlug(id);
        const p = res.product;
        setName(p.name);
        setDescription(p.description);
        setCategory(p.category);
        setSubcategory(p.subcategory);
        setBrand(p.brand);
        setSku(p.sku);
        setPrice(p.pricing.price);
        setOriginalPrice(p.pricing.originalPrice);
        setStock(p.stock);
        setVideo(p.video || '');
        setIsFeatured(Boolean(p.isFeatured));
        setIsTrending(Boolean(p.isTrending));
        setIsNewArrival(Boolean(p.isNewArrival));
        setImages(p.images?.map((img: any) => img.url) || []);
        setSpecifications(p.specifications || []);
        setVariants(p.variants || []);
      } catch (err: any) {
        toastError(err.message || 'Failed to load product for editing.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchExistingProduct();
  }, [id, isEditing]);

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSpec = () => {
    setSpecifications((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleUpdateSpec = (index: number, field: 'key' | 'value', val: string) => {
    setSpecifications((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: val } : s))
    );
  };

  const handleRemoveSpec = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    const nextNum = variants.length + 1;
    setVariants((prev) => [
      ...prev,
      {
        sku: `${sku || 'SKU'}-V${nextNum}`,
        title: `Edition ${nextNum}`,
        color: 'Standard',
        price: Number(price) || 0,
        originalPrice: Number(originalPrice) || Number(price) || 0,
        stock: 10,
      },
    ]);
  };

  const handleUpdateVariant = (index: number, field: string, val: any) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: val } : v))
    );
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !sku || !category) {
      toastError('Please fill all mandatory product fields.');
      return;
    }

    setIsSaving(true);
    const payload = {
      name,
      description,
      category,
      subcategory,
      brand,
      sku: sku.toUpperCase().trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      stock: Number(stock) || 0,
      video,
      isFeatured,
      isTrending,
      isNewArrival,
      images,
      specifications: specifications.filter((s) => s.key && s.value),
      variants: variants.map((v) => ({
        ...v,
        price: Number(v.price),
        originalPrice: Number(v.originalPrice || v.price),
        stock: Number(v.stock),
      })),
    };

    try {
      if (isEditing && id) {
        await api.adminUpdateProduct(id, payload);
        success('Product updated successfully.');
      } else {
        await api.adminCreateProduct(payload);
        success('Product created successfully.');
      }
      navigate('/admin/products');
    } catch (err: any) {
      toastError(err.message || 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-xs text-zinc-500 animate-pulse">
        Loading product information...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
        <div>
          <Link to="/admin/products" className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products Catalog
          </Link>
          <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">
            {isEditing ? `Edit Product: ${name}` : 'Create New Product Record'}
          </h1>
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSubmit}
          className="px-6 py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Product Record'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Attributes Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-2 border-b border-zinc-100">
            Core Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-zinc-700 mb-1">Product Name / Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ultra Carbon 14 OLED Laptop"
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Base SKU *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. VEL-C14-BASE"
                className="w-full p-2.5 rounded-lg border border-zinc-200 uppercase font-mono focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Brand Name *</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Veloce / AcousticPro"
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Primary Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950 bg-white"
              >
                <option value="Electronics">Electronics</option>
                <option value="Fashion & Apparel">Fashion & Apparel</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Sports & Fitness">Sports & Fitness</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Subcategory *</label>
              <input
                type="text"
                required
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Audio & Headphones / Laptops"
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-zinc-700 mb-1">Comprehensive Description *</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed product specifications, materials, and features..."
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-2 border-b border-zinc-100">
            Pricing & Inventory
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || '')}
                placeholder="14999"
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Original / MRP Price (₹)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value) || '')}
                placeholder="19999"
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Available Stock Units *</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value) || '')}
                placeholder="50"
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-zinc-800">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-zinc-950"
              />
              <span>Feature on Homepage Showcase</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-zinc-800">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="w-4 h-4 rounded text-zinc-950"
              />
              <span>Mark as Trending Deal</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-zinc-800">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="w-4 h-4 rounded text-zinc-950"
              />
              <span>Tag as New Arrival</span>
            </label>
          </div>
        </div>

        {/* Media / Images Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-2 border-b border-zinc-100 flex items-center justify-between">
            <span>Product Media & Cloudinary Gallery</span>
            <span className="text-[11px] text-zinc-400 font-normal">Supports CDN URLs and Cloudinary IDs</span>
          </h3>

          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Paste high-res image URL (e.g. Unsplash or Cloudinary)"
              className="flex-1 text-xs p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 rounded-lg bg-zinc-950 text-white font-semibold text-xs hover:bg-zinc-800"
            >
              Add Photo
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {images.map((imgUrl, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 group">
                <img src={imgUrl} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-zinc-950/80 text-white hover:bg-rose-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase bg-zinc-950/80 text-white px-2 py-0.5 rounded">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Variants Builder Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Product Variants & Custom Editions ({variants.length})
            </h3>
            <button
              type="button"
              onClick={handleAddVariant}
              className="text-xs font-semibold text-zinc-950 hover:text-zinc-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Variant
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/70 grid grid-cols-1 sm:grid-cols-6 gap-3 text-xs items-center">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Variant Title</label>
                  <input
                    type="text"
                    value={v.title}
                    onChange={(e) => handleUpdateVariant(i, 'title', e.target.value)}
                    className="w-full p-2 rounded-lg border border-zinc-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Variant SKU</label>
                  <input
                    type="text"
                    value={v.sku}
                    onChange={(e) => handleUpdateVariant(i, 'sku', e.target.value)}
                    className="w-full p-2 rounded-lg border border-zinc-200 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={v.price}
                    onChange={(e) => handleUpdateVariant(i, 'price', Number(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg border border-zinc-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Stock</label>
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => handleUpdateVariant(i, 'stock', Number(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg border border-zinc-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Attribute</label>
                  <input
                    type="text"
                    placeholder="Color / Size"
                    value={v.color || v.size || ''}
                    onChange={(e) => handleUpdateVariant(i, 'color', e.target.value)}
                    className="w-full p-2 rounded-lg border border-zinc-200 bg-white"
                  />
                </div>
                <div className="flex justify-end pt-3 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(i)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Specifications Builder Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Technical Specifications ({specifications.length})
            </h3>
            <button
              type="button"
              onClick={handleAddSpec}
              className="text-xs font-semibold text-zinc-950 hover:text-zinc-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Specification
            </button>
          </div>

          <div className="space-y-2">
            {specifications.map((spec, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <input
                  type="text"
                  placeholder="Key (e.g. Weight / Connectivity)"
                  value={spec.key}
                  onChange={(e) => handleUpdateSpec(i, 'key', e.target.value)}
                  className="w-1/3 p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 240g / Bluetooth 5.3)"
                  value={spec.value}
                  onChange={(e) => handleUpdateSpec(i, 'value', e.target.value)}
                  className="flex-1 p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(i)}
                  className="p-2 text-zinc-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-md"
          >
            {isSaving ? 'Saving Record...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};
