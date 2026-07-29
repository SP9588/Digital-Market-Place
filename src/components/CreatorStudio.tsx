import React, { useState } from 'react';
import { DigitalProduct, CategoryId, Currency } from '../types/marketplace';
import { ALL_CATEGORIES } from '../data/categories';
import { formatCurrency } from '../utils/currency';
import {
  Store,
  Plus,
  DollarSign,
  TrendingUp,
  Percent,
  Upload,
  CheckCircle2,
  Trash2,
  Eye,
  CreditCard,
  Building,
  Sparkles,
} from 'lucide-react';

interface CreatorStudioProps {
  products: DigitalProduct[];
  currency: Currency;
  onAddProduct: (newProduct: DigitalProduct) => void;
  onDeleteProduct: (id: string) => void;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({
  products,
  currency,
  onAddProduct,
  onDeleteProduct,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('templates');
  const [subcategory, setSubcategory] = useState('Figma templates');
  const [price, setPrice] = useState(29);
  const [description, setDescription] = useState('');
  const [previewType, setPreviewType] = useState<any>('image');
  const [previewUrl, setPreviewUrl] = useState(
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800'
  );
  const [fileFormat, setFileFormat] = useState('.ZIP, .FIG, .PDF');
  const [fileSize, setFileSize] = useState('45 MB');
  const [tags, setTags] = useState('digital-product, open-ocean, template');

  const selectedCatInfo = ALL_CATEGORIES.find((c) => c.id === categoryId);

  // Calculated creator stats
  const totalSales = products.reduce((acc, p) => acc + p.downloadCount, 0);
  const grossRevenue = products.reduce((acc, p) => acc + p.price * p.downloadCount, 0);
  const openOceanCommission = Math.round(grossRevenue * 0.10); // 10% marketplace fee
  const netEarnings = grossRevenue - openOceanCommission;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newProd: DigitalProduct = {
      id: 'prod-custom-' + Date.now(),
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      categoryId,
      categoryName: selectedCatInfo?.name || 'Digital Products',
      subcategory: subcategory || selectedCatInfo?.subcategories[0] || 'General',
      price: Number(price),
      currency: 'USD',
      creatorId: 'c-user-store',
      creatorName: 'My Open Ocean Creator Store',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      creatorRating: 5.0,
      creatorSales: 0,
      rating: 5.0,
      reviewCount: 0,
      fileFormat,
      fileSize,
      downloadCount: 0,
      tags: tags.split(',').map((t) => t.trim()),
      description,
      features: ['100% Original Verified Asset', 'Commercial License Included', 'Lifetime Updates'],
      previewType,
      previewUrl,
      licenses: [
        {
          type: 'personal',
          name: 'Personal License',
          price: Number(price),
          description: 'For personal and non-commercial projects.',
          features: ['1 Project', 'Non-commercial'],
        },
        {
          type: 'commercial',
          name: 'Commercial License',
          price: Math.round(Number(price) * 1.8),
          description: 'For commercial apps and client builds.',
          features: ['Commercial rights', 'Unlimited end products'],
        },
      ],
      attributes: {
        Compatibility: 'Universal',
        Version: '1.0.0',
      },
      isVerified: true,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    onAddProduct(newProd);
    setShowAddModal(false);
    setTitle('');
    setDescription('');
    alert('Product listed successfully on Open Ocean marketplace!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Open Ocean Creator Hub
            </span>
            <span className="text-xs text-slate-400">• Marketplace Payment Model</span>
          </div>
          <h1 className="text-2xl font-black text-white">Seller Dashboard & Payouts</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            List digital products across all 24 categories. Open Ocean retains a 10% platform fee and distributes payouts directly.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>List New Digital Product</span>
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Gross Sales Volume</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {formatCurrency(grossRevenue, currency)}
          </p>
          <p className="text-[10px] text-slate-500">From {totalSales} total asset downloads</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Open Ocean Fee (10%)</span>
            <Percent className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-sky-400 font-mono">
            {formatCurrency(openOceanCommission, currency)}
          </p>
          <p className="text-[10px] text-slate-500">Platform commission & gateway processing</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Net Creator Payout (90%)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {formatCurrency(netEarnings, currency)}
          </p>
          <p className="text-[10px] text-slate-500">Available for instant settlement</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Listings</span>
            <Store className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{products.length}</p>
          <p className="text-[10px] text-slate-500">Across 24 taxonomy categories</p>
        </div>
      </div>

      {/* Payout Connection Settings */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Building className="w-4 h-4 text-emerald-400" />
          Connected Payout Gateways & Payout Schedule
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 block">Stripe Connect Custom</span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected (Payout Ready)
              </span>
            </div>
            <CreditCard className="w-5 h-5 text-slate-400" />
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 block">PayPal Hyperwallet</span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            </div>
            <DollarSign className="w-5 h-5 text-slate-400" />
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 block">Payout Frequency</span>
              <span className="text-[10px] text-sky-400 font-bold uppercase">Weekly (Fridays)</span>
            </div>
            <TrendingUp className="w-5 h-5 text-sky-400" />
          </div>
        </div>
      </div>

      {/* Active Listings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">
            Your Digital Products Inventory ({products.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Product Asset</th>
                <th className="p-4">Category</th>
                <th className="p-4">Base Price</th>
                <th className="p-4">Downloads</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-800/40">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.previewUrl}
                        alt={prod.title}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-800"
                      />
                      <div>
                        <span className="font-bold text-white block line-clamp-1">{prod.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{prod.fileFormat}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-sky-400">{prod.categoryName}</td>
                  <td className="p-4 font-mono font-bold text-white">
                    {formatCurrency(prod.price, currency)}
                  </td>
                  <td className="p-4 font-mono text-emerald-400">{prod.downloadCount} sales</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onDeleteProduct(prod.id)}
                      className="p-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      title="Remove Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* List Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 my-auto">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                List Digital Asset on Open Ocean Marketplace
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master SaaS Next.js Marketplace Starter Kit"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Marketplace Category (24 Taxonomy)</label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      const newCat = e.target.value as CategoryId;
                      setCategoryId(newCat);
                      const catInfo = ALL_CATEGORIES.find((c) => c.id === newCat);
                      if (catInfo && catInfo.subcategories.length > 0) {
                        setSubcategory(catInfo.subcategories[0]);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Subcategory</label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    {selectedCatInfo?.subcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Base Price (USD $)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Interactive Preview Type</label>
                  <select
                    value={previewType}
                    onChange={(e) => setPreviewType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="image">Standard Image Preview</option>
                    <option value="audio">Interactive Audio Waveform</option>
                    <option value="3d">Interactive 3D Mesh Inspector</option>
                    <option value="code">Code / AI Prompt Inspector</option>
                    <option value="preset">Before/After Preset Compare</option>
                    <option value="pdf">eBook PDF Sample Reader</option>
                    <option value="giftcard">Digital Brand Voucher Pass</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">File Formats</label>
                  <input
                    type="text"
                    value={fileFormat}
                    onChange={(e) => setFileFormat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Upload Asset Preview / File (Computer, Phone, or Camera)
                </label>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <label className="flex-1 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold transition-all cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose File from Computer or Phone</span>
                      <input
                        type="file"
                        accept="*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
                            setFileSize(`${sizeMb} MB`);
                            setFileFormat(file.name.split('.').pop()?.toUpperCase() || 'FILE');
                            if (file.type.startsWith('image/')) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setPreviewUrl(ev.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }
                        }}
                      />
                    </label>

                    <label className="flex-1 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all cursor-pointer">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Capture with Phone Camera</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setPreviewUrl(ev.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {previewUrl && (
                    <div className="flex items-center gap-3 pt-1">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-800"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] text-slate-300 block truncate font-mono">
                          Image Data / Preview URL Loaded
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          Format: {fileFormat} • Size: {fileSize}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description & Licensing Terms</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your digital product, features, included assets..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
                >
                  Publish Listing to Open Ocean
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
