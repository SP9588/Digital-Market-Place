import React from 'react';
import { DigitalProduct } from '../types/marketplace';
import { ArrowRightLeft, X, Trash2, Layers } from 'lucide-react';

interface ProductCompareFloatingBarProps {
  comparedProducts: DigitalProduct[];
  onOpenCompareModal: () => void;
  onRemoveFromCompare: (productId: string) => void;
  onClearCompare: () => void;
}

export const ProductCompareFloatingBar: React.FC<ProductCompareFloatingBarProps> = ({
  comparedProducts,
  onOpenCompareModal,
  onRemoveFromCompare,
  onClearCompare,
}) => {
  if (comparedProducts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-sky-500/40 rounded-2xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-md flex items-center gap-3 sm:gap-4 animate-in slide-in-from-bottom-5 max-w-[95vw]">
      {/* Label */}
      <div className="flex items-center gap-2 pl-1">
        <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
          <ArrowRightLeft className="w-4 h-4" />
        </div>
        <div className="hidden md:block">
          <span className="text-xs font-bold text-white block">Compare Products</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {comparedProducts.length} of 3 items
          </span>
        </div>
      </div>

      {/* Selected Product Thumbnails */}
      <div className="flex items-center gap-2">
        {comparedProducts.map((p) => (
          <div
            key={p.id}
            className="relative group w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-950 overflow-hidden border border-sky-500/30 shrink-0"
          >
            <img src={p.previewUrl} alt={p.title} className="w-full h-full object-cover" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromCompare(p.id);
              }}
              className="absolute top-0.5 right-0.5 bg-slate-950/80 hover:bg-rose-500 text-white p-0.5 rounded-full transition-colors cursor-pointer"
              title={`Remove ${p.title}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Empty slots placeholders */}
        {Array.from({ length: 3 - comparedProducts.length }).map((_, idx) => (
          <div
            key={idx}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-[10px] font-mono shrink-0"
          >
            +{idx + 1}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
        <button
          onClick={onOpenCompareModal}
          className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg shadow-sky-500/20 whitespace-nowrap"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Compare Now</span>
        </button>

        <button
          onClick={onClearCompare}
          className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
          title="Clear all selected items"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
