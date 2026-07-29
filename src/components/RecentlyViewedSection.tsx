import React from 'react';
import { DigitalProduct, Currency } from '../types/marketplace';
import { Clock, Trash2, Star, ShoppingBag, ArrowRight, Eye } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface RecentlyViewedSectionProps {
  products: DigitalProduct[];
  currency: Currency;
  onSelectProduct: (product: DigitalProduct) => void;
  onAddToCart: (product: DigitalProduct) => void;
  onClearHistory: () => void;
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  products,
  currency,
  onSelectProduct,
  onAddToCart,
  onClearHistory,
}) => {
  if (products.length === 0) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wide uppercase flex items-center gap-2">
              <span>Recently Viewed Assets</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                {products.length} {products.length === 1 ? 'Item' : 'Items'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Quickly jump back to digital products you recently inspected
            </p>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="text-xs text-slate-400 hover:text-rose-400 bg-slate-950 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-rose-500/30 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          title="Clear recently viewed history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="font-semibold text-[11px]">Clear History</span>
        </button>
      </div>

      {/* Cards Grid / Scrollable */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {products.map((product) => {
          return (
            <div
              key={`recent-${product.id}`}
              onClick={() => onSelectProduct(product)}
              className="bg-slate-950 rounded-xl border border-slate-800 hover:border-sky-500/50 p-2.5 flex flex-col justify-between group transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-sky-500/5 relative"
            >
              <div className="space-y-2">
                {/* Image & Quick View Overlay */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900">
                  <img
                    src={product.previewUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-500 text-slate-950 font-extrabold text-[10px] flex items-center gap-1 shadow-md">
                      <Eye className="w-3 h-3" />
                      View
                    </span>
                  </div>
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] font-mono font-bold text-slate-300 border border-slate-800/80 backdrop-blur-sm">
                    {product.fileFormat[0] || 'Asset'}
                  </span>
                </div>

                {/* Info */}
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1 leading-snug">
                    {product.title}
                  </h4>
                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className="text-slate-400 truncate max-w-[100px]">
                      {product.creatorName}
                    </span>
                    <span className="text-amber-400 font-bold flex items-center gap-0.5 font-mono">
                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                      {product.rating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Add to Cart button */}
              <div className="pt-2.5 mt-2 border-t border-slate-900 flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 font-mono">
                  {formatCurrency(product.priceUsd, currency)}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-sky-500 hover:text-slate-950 text-slate-300 transition-all border border-slate-800 hover:border-sky-400 cursor-pointer active:scale-90"
                  title="Quick add to cart"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
