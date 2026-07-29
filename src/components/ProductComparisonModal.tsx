import React, { useState } from 'react';
import { DigitalProduct, Currency, LicenseType } from '../types/marketplace';
import { formatCurrency, convertPrice } from '../utils/currency';
import {
  X,
  ArrowRightLeft,
  Check,
  Plus,
  Trash2,
  ShieldCheck,
  Star,
  Download,
  FileCode,
  ShoppingCart,
  Eye,
  CheckCircle2,
  Search,
  Key,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparedProducts: DigitalProduct[];
  allProducts: DigitalProduct[];
  onRemoveFromCompare: (productId: string) => void;
  onAddToCompare: (product: DigitalProduct) => void;
  onClearCompare: () => void;
  currency: Currency;
  onAddToCart: (product: DigitalProduct, license: LicenseType) => void;
  onSelectProduct: (product: DigitalProduct) => void;
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  isOpen,
  onClose,
  comparedProducts,
  allProducts,
  onRemoveFromCompare,
  onAddToCompare,
  onClearCompare,
  currency,
  onAddToCart,
  onSelectProduct,
}) => {
  const [selectedLicenses, setSelectedLicenses] = useState<Record<string, LicenseType>>({});
  const [addingSlotIndex, setAddingSlotIndex] = useState<number | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');

  if (!isOpen) return null;

  // Selected License for a product, defaulting to 'personal'
  const getSelectedLicense = (productId: string): LicenseType => {
    return selectedLicenses[productId] || 'personal';
  };

  const handleLicenseChange = (productId: string, license: LicenseType) => {
    setSelectedLicenses((prev) => ({ ...prev, [productId]: license }));
  };

  // Products available to add to compare (excluding already added)
  const availableToCompare = allProducts.filter(
    (p) => !comparedProducts.some((cp) => cp.id === p.id) &&
      (pickerSearch === '' ||
        p.title.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(pickerSearch.toLowerCase()))
  );

  // Extract all unique attribute keys across compared products
  const allAttributeKeys: string[] = Array.from(
    new Set<string>(
      comparedProducts.flatMap((p) => Object.keys(p.attributes || {}))
    )
  );

  // License Types list for matrix
  const licenseTypesList: { id: LicenseType; label: string }[] = [
    { id: 'personal', label: 'Personal License' },
    { id: 'commercial', label: 'Commercial License' },
    { id: 'extended', label: 'Extended License' },
    { id: 'enterprise', label: 'Enterprise License' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl text-slate-100 my-auto animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Product Side-by-Side Comparison</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {comparedProducts.length} / 3 Selected
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Compare prices, features, license rights, and file technical specifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comparedProducts.length > 0 && (
              <button
                onClick={onClearCompare}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                title="Clear all compared items"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Matrix */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar">

          {comparedProducts.length === 0 ? (
            <div className="text-center py-16 bg-slate-950/60 rounded-2xl border border-slate-800 p-8 space-y-4 max-w-md mx-auto my-8">
              <ArrowRightLeft className="w-12 h-12 text-sky-400 mx-auto opacity-80" />
              <div>
                <h4 className="text-base font-bold text-white">No Products Selected for Comparison</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Select up to 3 digital assets from the catalog to compare their feature sets, pricing, and license terms side-by-side.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-sky-500/20"
              >
                Browse Marketplace Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-6">

              {/* PRODUCT CARDS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((slotIndex) => {
                  const product = comparedProducts[slotIndex];

                  if (product) {
                    const currentLic = getSelectedLicense(product.id);
                    const licObj = product.licenses.find((l) => l.type === currentLic) || product.licenses[0];
                    const effectivePrice = licObj ? licObj.price : (product.salePrice || product.price);

                    return (
                      <div
                        key={product.id}
                        className="p-4 bg-slate-950 rounded-2xl border border-sky-500/30 flex flex-col justify-between relative space-y-3 shadow-xl group hover:border-sky-400/60 transition-all"
                      >
                        {/* Remove button */}
                        <button
                          onClick={() => onRemoveFromCompare(product.id)}
                          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-slate-900/90 text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="space-y-3">
                          {/* Image Thumbnail */}
                          <div
                            className="relative w-full h-36 bg-slate-900 rounded-xl overflow-hidden cursor-pointer group-hover:scale-[1.01] transition-transform"
                            onClick={() => onSelectProduct(product)}
                          >
                            <img
                              src={product.previewUrl}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-sky-400 border border-sky-500/30 backdrop-blur">
                              {product.categoryName}
                            </span>
                          </div>

                          {/* Title & Rating */}
                          <div>
                            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-semibold mb-1">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{product.rating.toFixed(1)}</span>
                              <span className="text-slate-500 font-normal">({product.reviewCount} reviews)</span>
                              {product.isVerified && (
                                <span className="ml-auto text-[10px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                  <ShieldCheck className="w-3 h-3" /> Verified
                                </span>
                              )}
                            </div>
                            <h4
                              onClick={() => onSelectProduct(product)}
                              className="font-bold text-sm text-white hover:text-sky-400 transition-colors line-clamp-2 cursor-pointer h-10"
                            >
                              {product.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-1">
                              by <strong className="text-slate-200">{product.creatorName}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Price & License Selector */}
                        <div className="pt-3 border-t border-slate-800 space-y-2.5">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              Selected License
                            </span>
                            <span className="text-sm font-black font-mono text-emerald-400">
                              {formatCurrency(effectivePrice, currency)}
                            </span>
                          </div>

                          <select
                            value={currentLic}
                            onChange={(e) => handleLicenseChange(product.id, e.target.value as LicenseType)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer font-medium"
                          >
                            {product.licenses.map((lic) => (
                              <option key={lic.type} value={lic.type}>
                                {lic.name} ({formatCurrency(lic.price, currency)})
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => onAddToCart(product, currentLic)}
                              className="flex-1 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/10"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </button>

                            <button
                              onClick={() => onSelectProduct(product)}
                              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                              title="Quick View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  {/* Empty Slot Card */}
                  return (
                    <div
                      key={`empty-${slotIndex}`}
                      className="p-6 bg-slate-950/40 rounded-2xl border-2 border-dashed border-slate-800/80 flex flex-col items-center justify-center text-center space-y-3 min-h-[340px]"
                    >
                      <div className="p-3 rounded-full bg-slate-900 text-slate-500 border border-slate-800">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-300">Slot {slotIndex + 1} Available</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Select another product to compare side-by-side</p>
                      </div>

                      {addingSlotIndex === slotIndex ? (
                        <div className="w-full space-y-2 pt-2 animate-in fade-in">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              autoFocus
                              value={pickerSearch}
                              onChange={(e) => setPickerSearch(e.target.value)}
                              placeholder="Search products..."
                              className="w-full bg-slate-900 border border-sky-500/50 rounded-xl pl-8 pr-2 py-1.5 text-xs text-white focus:outline-none"
                            />
                          </div>

                          <div className="max-h-40 overflow-y-auto space-y-1 text-left custom-scrollbar border border-slate-800 rounded-xl bg-slate-900 p-1">
                            {availableToCompare.length === 0 ? (
                              <p className="text-[10px] text-slate-500 p-2 text-center">No other products found</p>
                            ) : (
                              availableToCompare.map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    onAddToCompare(p);
                                    setAddingSlotIndex(null);
                                    setPickerSearch('');
                                  }}
                                  className="w-full p-2 rounded-lg hover:bg-slate-800 flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer text-left"
                                >
                                  <span className="font-semibold text-slate-200 line-clamp-1">{p.title}</span>
                                  <span className="font-mono text-[10px] text-emerald-400 font-bold shrink-0">
                                    {formatCurrency(p.salePrice || p.price, currency)}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>

                          <button
                            onClick={() => setAddingSlotIndex(null)}
                            className="text-[10px] text-slate-400 hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingSlotIndex(slotIndex)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Product</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* TECHNICAL SPECIFICATIONS & OVERVIEW MATRIX */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4" />
                  <span>Technical Specifications & Digital File Info</span>
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                        <th className="py-2.5 px-3 w-1/4">Specification</th>
                        {comparedProducts.map((p) => (
                          <th key={p.id} className="py-2.5 px-3 font-mono text-white">
                            {p.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      <tr>
                        <td className="py-2.5 px-3 font-sans text-slate-400 font-semibold">Category / Sub</td>
                        {comparedProducts.map((p) => (
                          <td key={p.id} className="py-2.5 px-3 text-slate-200">
                            {p.categoryName} • <span className="text-slate-400">{p.subcategory}</span>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans text-slate-400 font-semibold">File Format</td>
                        {comparedProducts.map((p) => (
                          <td key={p.id} className="py-2.5 px-3 text-sky-300 font-bold">
                            {p.fileFormat}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans text-slate-400 font-semibold">File Size</td>
                        {comparedProducts.map((p) => (
                          <td key={p.id} className="py-2.5 px-3 text-slate-300">
                            {p.fileSize}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans text-slate-400 font-semibold">Downloads</td>
                        {comparedProducts.map((p) => (
                          <td key={p.id} className="py-2.5 px-3 text-emerald-400 font-bold">
                            {p.downloadCount.toLocaleString()} downloads
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans text-slate-400 font-semibold">Base Price (USD)</td>
                        {comparedProducts.map((p) => (
                          <td key={p.id} className="py-2.5 px-3 font-bold text-white">
                            {formatCurrency(p.salePrice || p.price, currency)}
                            {p.salePrice && (
                              <span className="text-slate-500 line-through text-[10px] ml-1.5">
                                {formatCurrency(p.price, currency)}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FEATURES COMPARISON ROW MATRIX */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Key Features & Capabilities Matrix</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {comparedProducts.map((p) => (
                    <div key={p.id} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                      <p className="text-xs font-bold text-white line-clamp-1 pb-1 border-b border-slate-800">
                        {p.title}
                      </p>
                      <ul className="space-y-1.5 text-xs">
                        {p.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="text-[11px]">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* LICENSES MATRIX */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Key className="w-4 h-4" />
                  <span>License Tier Price Matrix</span>
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                        <th className="py-2.5 px-3 w-1/4">License Tier</th>
                        {comparedProducts.map((p) => (
                          <th key={p.id} className="py-2.5 px-3 font-semibold text-white">
                            {p.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {licenseTypesList.map((licType) => (
                        <tr key={licType.id}>
                          <td className="py-2.5 px-3 font-sans text-slate-300 font-semibold">{licType.label}</td>
                          {comparedProducts.map((p) => {
                            const opt = p.licenses.find((l) => l.type === licType.id);
                            return (
                              <td key={p.id} className="py-2.5 px-3">
                                {opt ? (
                                  <span className="font-bold text-emerald-400">
                                    {formatCurrency(opt.price, currency)}
                                  </span>
                                ) : (
                                  <span className="text-slate-600 font-sans italic">Not Available</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ATTRIBUTES COMPARISON MATRIX (IF ANY) */}
              {allAttributeKeys.length > 0 && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>Product Attributes Breakdown</span>
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                          <th className="py-2.5 px-3 w-1/4">Attribute</th>
                          {comparedProducts.map((p) => (
                            <th key={p.id} className="py-2.5 px-3 font-semibold text-white">
                              {p.title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-[11px]">
                        {allAttributeKeys.map((key) => (
                          <tr key={key}>
                            <td className="py-2.5 px-3 font-semibold text-slate-400 capitalize">{key}</td>
                            {comparedProducts.map((p) => (
                              <td key={p.id} className="py-2.5 px-3 text-slate-200 font-mono">
                                {p.attributes?.[key] || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0 text-xs text-slate-400">
          <span>Comparing up to 3 digital assets side-by-side</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Done Comparing
          </button>
        </div>

      </div>
    </div>
  );
};
