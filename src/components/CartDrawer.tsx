import React, { useState } from 'react';
import {
  ShoppingBag,
  X,
  Trash2,
  ArrowRight,
  RefreshCw,
  Globe,
  Coins,
  Check,
  Info,
  Plus,
  Minus,
  Percent,
  Sparkles,
} from 'lucide-react';
import { CartItem, Currency } from '../types/marketplace';
import { CURRENCIES, formatCurrency } from '../utils/currency';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currency: Currency;
  onCurrencyChange: (newCurrency: Currency) => void;
  onRemoveFromCart: (index: number) => void;
  onUpdateQuantity?: (index: number, newQty: number) => void;
  onProceedToCheckout: () => void;
}

export const getItemVolumeDiscountRate = (quantity: number): number => {
  if (quantity >= 20) return 0.20; // 20% OFF for 20+ seats
  if (quantity >= 10) return 0.15; // 15% OFF for 10-19 seats
  if (quantity >= 5) return 0.10;  // 10% OFF for 5-9 seats
  return 0;
};

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  currency,
  onCurrencyChange,
  onRemoveFromCart,
  onUpdateQuantity,
  onProceedToCheckout,
}) => {
  const [isRefreshingFx, setIsRefreshingFx] = useState(false);
  const [showUsdReference, setShowUsdReference] = useState(true);

  if (!isOpen) return null;

  // Calculate cart subtotal with volume tier discounts applied
  const cartItemsWithDiscounts = cartItems.map((item) => {
    const discountRate = getItemVolumeDiscountRate(item.quantity);
    const effectiveUnitPrice = item.price * (1 - discountRate);
    const itemTotalUsd = effectiveUnitPrice * item.quantity;
    const rawTotalUsd = item.price * item.quantity;
    const totalSavingsUsd = rawTotalUsd - itemTotalUsd;

    return {
      ...item,
      discountRate,
      effectiveUnitPrice,
      itemTotalUsd,
      totalSavingsUsd,
    };
  });

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalUsd = cartItemsWithDiscounts.reduce((acc, item) => acc + item.itemTotalUsd, 0);
  const totalVolumeSavingsUsd = cartItemsWithDiscounts.reduce((acc, item) => acc + item.totalSavingsUsd, 0);

  const selectedCurrencyInfo = CURRENCIES[currency] || CURRENCIES.USD;

  // Handle mock FX rate refresh
  const handleRefreshFxRates = () => {
    setIsRefreshingFx(true);
    setTimeout(() => {
      setIsRefreshingFx(false);
    }, 600);
  };

  const availableCurrencies = Object.keys(CURRENCIES) as Currency[];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl text-slate-100 animate-in slide-in-from-right duration-200">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white leading-none">Shopping Cart</h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  {totalQuantity} {totalQuantity === 1 ? 'digital item' : 'digital items'} selected
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Currency Switcher Bar */}
          <div className="mt-4 p-3 bg-slate-950 border border-slate-800/90 rounded-2xl space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>Display Currency</span>
              </div>

              {/* Live Rate Badge */}
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live FX
                </span>
                <button
                  onClick={handleRefreshFxRates}
                  className="p-1 text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
                  title="Refresh live exchange rate"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingFx ? 'animate-spin text-sky-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Currency Pill Options */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {availableCurrencies.map((cCode) => {
                const cInfo = CURRENCIES[cCode];
                const isSelected = currency === cCode;
                return (
                  <button
                    key={cCode}
                    onClick={() => onCurrencyChange(cCode)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{cInfo.symbol}</span>
                    <span>{cInfo.code}</span>
                  </button>
                );
              })}
            </div>

            {/* Exchange Rate Conversion Detail Note */}
            {currency !== 'USD' && (
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-slate-400">
                  <Coins className="w-3 h-3 text-amber-400" />
                  1 USD = {selectedCurrencyInfo.rate} {selectedCurrencyInfo.code}
                </span>

                <button
                  onClick={() => setShowUsdReference(!showUsdReference)}
                  className="text-sky-400 hover:underline cursor-pointer"
                >
                  {showUsdReference ? 'Hide USD baseline' : 'Show USD baseline'}
                </button>
              </div>
            )}
          </div>

          {/* Volume Tier Discount Info Banner */}
          <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs flex items-center justify-between text-amber-300">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Percent className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                <strong className="font-extrabold">Volume Discount:</strong> 5+ seats = 10% OFF | 10+ = 15% OFF
              </span>
            </div>
          </div>

          {/* Cart Item List */}
          <div className="mt-2 flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {cartItemsWithDiscounts.length > 0 ? (
              cartItemsWithDiscounts.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5 hover:border-slate-700 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.product.previewUrl}
                        alt={item.product.title}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                          {item.product.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-sky-400 uppercase tracking-wider font-semibold">
                            License: {item.selectedLicense}
                          </span>
                          {item.discountRate > 0 && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {(item.discountRate * 100)}% Volume Discount
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveFromCart(idx)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl cursor-pointer transition-colors shrink-0"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Selector & Price Summary */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                    <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => onUpdateQuantity && onUpdateQuantity(idx, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Decrease Quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-6 text-center font-mono font-bold text-white text-xs">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => onUpdateQuantity && onUpdateQuantity(idx, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Increase Quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right font-mono">
                      <div className="flex items-baseline gap-2 justify-end">
                        <span className="font-extrabold text-sm text-emerald-400">
                          {formatCurrency(item.itemTotalUsd, currency)}
                        </span>
                        {item.discountRate > 0 && (
                          <span className="text-[10px] text-slate-500 line-through">
                            {formatCurrency(item.price * item.quantity, currency)}
                          </span>
                        )}
                      </div>
                      {currency !== 'USD' && showUsdReference && (
                        <span className="font-mono text-[10px] text-slate-500 block">
                          (${item.itemTotalUsd.toFixed(2)} USD)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-500 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto opacity-40">
                  <ShoppingBag className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-300">Your cart is empty</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Explore digital assets, AI prompts, 3D models, and eBooks in our marketplace.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cart Footer Summary */}
          {cartItemsWithDiscounts.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-3 shrink-0">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Subtotal ({totalQuantity} licenses):</span>
                  <span className="font-mono text-slate-200">
                    {formatCurrency(cartTotalUsd, currency)}
                  </span>
                </div>

                {totalVolumeSavingsUsd > 0 && (
                  <div className="flex items-center justify-between text-amber-400 font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" /> Volume Tier Savings:
                    </span>
                    <span className="font-bold">
                      -{formatCurrency(totalVolumeSavingsUsd, currency)}
                    </span>
                  </div>
                )}

                {currency !== 'USD' && showUsdReference && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Base USD Equivalent:</span>
                    <span>${cartTotalUsd.toFixed(2)} USD</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-400">
                  <span>Instant Digital Delivery:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Free
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 font-bold text-sm">
                  <span className="text-white">Total ({currency}):</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400 font-mono block">
                      {formatCurrency(cartTotalUsd, currency)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-normal">
                      Converted at 1 USD = {selectedCurrencyInfo.rate} {selectedCurrencyInfo.code}
                    </span>
                  </div>
                </div>
              </div>


              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm transition-all cursor-pointer shadow-xl shadow-sky-500/20 active:scale-98 flex items-center justify-center gap-2"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
