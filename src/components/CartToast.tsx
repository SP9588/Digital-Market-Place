import React, { useEffect, useState } from 'react';
import { DigitalProduct, LicenseType, Currency } from '../types/marketplace';
import { ShoppingBag, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export interface CartToastData {
  id: string;
  product: DigitalProduct;
  quantity: number;
  license: LicenseType;
  price: number;
}

interface CartToastProps {
  toast: CartToastData | null;
  currency: Currency;
  onViewCart: () => void;
  onClose: () => void;
  autoDismissMs?: number;
}

export const CartToast: React.FC<CartToastProps> = ({
  toast,
  currency,
  onViewCart,
  onClose,
  autoDismissMs = 5000,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) return;

    setProgress(100);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPercent = Math.max(0, 100 - (elapsed / autoDismissMs) * 100);
      setProgress(remainingPercent);

      if (remainingPercent <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast, autoDismissMs, onClose]);

  if (!toast) return null;

  const { product, quantity, license, price } = toast;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full mx-4 sm:mx-0 bg-slate-900/95 border border-sky-500/50 rounded-2xl shadow-2xl shadow-sky-500/20 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* Progress Bar */}
      <div className="h-1 bg-slate-800 w-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4 space-y-3">
        {/* Toast Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>Added to Cart</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Item Added
              </span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Details Row */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
          <img
            src={product.previewUrl}
            alt={product.title}
            className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate group-hover:text-sky-300">
              {product.title}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
              <span className="text-sky-400 font-bold">Qty: {quantity}</span>
              <span>•</span>
              <span className="capitalize">{license} License</span>
            </div>
            <div className="text-xs font-extrabold text-emerald-400 mt-0.5">
              {formatCurrency(price * quantity, currency)}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              onClose();
              onViewCart();
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-sky-500/20 cursor-pointer flex items-center justify-center gap-1.5 group active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>View Cart</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={onClose}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-colors cursor-pointer border border-slate-700"
          >
            Keep Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
