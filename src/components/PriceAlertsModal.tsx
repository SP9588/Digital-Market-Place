import React, { useState } from 'react';
import { DigitalProduct, Currency, PriceAlert } from '../types/marketplace';
import { formatCurrency, convertPrice } from '../utils/currency';
import {
  Bell,
  Trash2,
  X,
  ShoppingCart,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit2,
  Check,
  Compass,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface PriceAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceAlerts: PriceAlert[];
  allProducts: DigitalProduct[];
  currency: Currency;
  onDeleteAlert: (productId: string) => void;
  onUpdateAlert: (productId: string, newTargetPrice: number) => void;
  onClearAllAlerts: () => void;
  onAddToCart: (product: DigitalProduct) => void;
  onSelectProduct: (product: DigitalProduct) => void;
}

export const PriceAlertsModal: React.FC<PriceAlertsModalProps> = ({
  isOpen,
  onClose,
  priceAlerts,
  allProducts,
  currency,
  onDeleteAlert,
  onUpdateAlert,
  onClearAllAlerts,
  onAddToCart,
  onSelectProduct,
}) => {
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPriceInput, setEditPriceInput] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'triggered'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Map products to their price alerts
  const alertItems = priceAlerts
    .map((alert) => {
      const product = allProducts.find((p) => p.id === alert.productId);
      if (!product) return null;

      const currentPriceUsd = product.salePrice || product.price;
      const currentPriceInCurrency = convertPrice(currentPriceUsd, currency);
      const targetPriceInCurrency = convertPrice(alert.targetPrice, currency);

      const isTriggered = currentPriceInCurrency <= targetPriceInCurrency;
      const discountPercent =
        product.price > currentPriceUsd
          ? Math.round(((product.price - currentPriceUsd) / product.price) * 100)
          : 0;

      return {
        alert,
        product,
        currentPriceUsd,
        currentPriceInCurrency,
        targetPriceInCurrency,
        isTriggered,
        discountPercent,
      };
    })
    .filter(Boolean) as Array<{
    alert: PriceAlert;
    product: DigitalProduct;
    currentPriceUsd: number;
    currentPriceInCurrency: number;
    targetPriceInCurrency: number;
    isTriggered: boolean;
    discountPercent: number;
  }>;

  const triggeredCount = alertItems.filter((i) => i.isTriggered).length;

  const displayedItems =
    filterMode === 'triggered'
      ? alertItems.filter((i) => i.isTriggered)
      : alertItems;

  const handleStartEdit = (productId: string, currentTargetCurrency: number) => {
    setEditingProductId(productId);
    setEditPriceInput(currentTargetCurrency.toString());
  };

  const handleSaveEdit = (productId: string) => {
    const val = parseFloat(editPriceInput);
    if (!isNaN(val) && val > 0) {
      // convert from current currency back to USD base if needed
      // but for simplicity onUpdateAlert can accept the currency value or converted
      // Let's pass the value converted back to USD
      const convertedUsd = convertPrice(val, 'USD', currency); // inverted conversion logic
      onUpdateAlert(productId, convertedUsd);
      setEditingProductId(null);
      showToast('Price alert updated!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="absolute top-4 right-16 z-50 bg-slate-950 text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Bell className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-lg text-white">Price Drop Alerts</h2>
                {triggeredCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {triggeredCount} Deal{triggeredCount > 1 ? 's' : ''} Met
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Track target price thresholds for digital templates, graphics, and software.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls & Filter */}
        {alertItems.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 shrink-0 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                All Active ({alertItems.length})
              </button>
              <button
                onClick={() => setFilterMode('triggered')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterMode === 'triggered'
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Price Met ({triggeredCount})</span>
              </button>
            </div>

            <button
              onClick={onClearAllAlerts}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Alerts</span>
            </button>
          </div>
        )}

        {/* Alerts List Scrollable area */}
        <div className="overflow-y-auto space-y-3 pr-1 flex-1">
          {displayedItems.length > 0 ? (
            displayedItems.map(
              ({
                alert,
                product,
                currentPriceInCurrency,
                targetPriceInCurrency,
                isTriggered,
                discountPercent,
              }) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isTriggered
                      ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={product.previewUrl}
                      alt={product.title}
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                      className="w-14 h-14 rounded-lg object-cover border border-slate-800 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    />

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-white hover:text-sky-400 cursor-pointer line-clamp-1"
                          onClick={() => {
                            onSelectProduct(product);
                            onClose();
                          }}
                        >
                          {product.title}
                        </span>
                        {isTriggered && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                            🎯 Price Met!
                          </span>
                        )}
                        {discountPercent > 0 && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            -{discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400">
                        By {product.creatorName} • Category: {product.categoryName}
                      </p>

                      <div className="flex items-center gap-3 text-xs pt-0.5">
                        <span className="text-slate-400">
                          Current Price:{' '}
                          <span className="font-mono font-bold text-white">
                            {formatCurrency(currentPriceInCurrency, currency)}
                          </span>
                        </span>

                        <span className="text-slate-400">•</span>

                        <span className="text-slate-400">
                          Target Alert:{' '}
                          <span
                            className={`font-mono font-bold ${
                              isTriggered ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {formatCurrency(targetPriceInCurrency, currency)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Right Side */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                    {editingProductId === product.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.01"
                          value={editPriceInput}
                          onChange={(e) => setEditPriceInput(e.target.value)}
                          className="w-20 bg-slate-900 border border-amber-500/50 rounded-lg px-2 py-1 text-xs font-mono text-white focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveEdit(product.id)}
                          className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
                          title="Save Target Price"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingProductId(null)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          handleStartEdit(
                            product.id,
                            Math.round(targetPriceInCurrency * 100) / 100
                          )
                        }
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 text-xs transition-colors cursor-pointer"
                        title="Edit Target Price Alert"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onAddToCart(product);
                        showToast(`Added "${product.title}" to cart!`);
                      }}
                      className={`px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md ${
                        isTriggered
                          ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-400/20 active:scale-95'
                          : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/10'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{isTriggered ? 'Buy at Target!' : 'Add to Cart'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onDeleteAlert(product.id);
                        showToast('Alert removed');
                      }}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                      title="Remove Price Alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            )
          ) : (
            <div className="py-12 text-center space-y-3 bg-slate-950/40 rounded-xl border border-slate-800/80">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <div className="max-w-xs mx-auto">
                <h4 className="text-sm font-bold text-white">No Price Alerts Set</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Open any product detail modal and click "Set Price Alert" to track when prices drop to your target!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer info */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Auto-notifies when price target is reached.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
