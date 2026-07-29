import React, { useState } from 'react';
import {
  Compass,
  Search,
  ShoppingCart,
  Sparkles,
  Store,
  Folder,
  ChevronDown,
  User,
  BookOpen,
  GraduationCap,
  Music,
  Headphones,
  Video,
  Camera,
  Palette,
  Layout,
  Code,
  Globe,
  Bot,
  Briefcase,
  CheckSquare,
  Gamepad2,
  Box,
  Glasses,
  Megaphone,
  Gem,
  Gift,
  Wand2,
  Layers,
  Award,
  FileCheck,
  Heart,
  Bell,
  History,
  ArrowRightLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { CategoryId, Currency } from '../types/marketplace';
import { ALL_CATEGORIES } from '../data/categories';
import { CURRENCIES } from '../utils/currency';

interface HeaderProps {
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (catId: CategoryId | 'all', subcat?: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  cartCount: number;
  wishlistCount: number;
  compareCount?: number;
  priceAlertsCount?: number;
  triggeredAlertsCount?: number;
  onOpenCart: () => void;
  onOpenAiAssistant: () => void;
  onOpenPriceAlerts?: () => void;
  onOpenPaymentHistory?: () => void;
  onOpenCompare?: () => void;
  activeView: 'marketplace' | 'creator' | 'library' | 'governance' | 'wishlist';
  onNavigate: (view: 'marketplace' | 'creator' | 'library' | 'governance' | 'wishlist') => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  GraduationCap,
  Music,
  Headphones,
  Video,
  Camera,
  Palette,
  Layout,
  Code,
  Globe,
  Bot,
  Sparkles,
  Briefcase,
  CheckSquare,
  Gamepad2,
  Box,
  Glasses,
  Megaphone,
  Gem,
  Gift,
  Wand2,
  Layers,
  Award,
  FileCheck,
};

export const Header: React.FC<HeaderProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  currency,
  onCurrencyChange,
  cartCount,
  wishlistCount,
  compareCount = 0,
  priceAlertsCount = 0,
  triggeredAlertsCount = 0,
  onOpenCart,
  onOpenAiAssistant,
  onOpenPriceAlerts,
  onOpenPaymentHistory,
  onOpenCompare,
  activeView,
  onNavigate,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<CategoryId | null>('books');

  const currentHoveredInfo = ALL_CATEGORIES.find((c) => c.id === hoveredCat);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                onNavigate('marketplace');
                onSelectCategory('all');
              }}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                  OPEN OCEAN
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    GLOBAL
                  </span>
                </span>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest hidden sm:block">
                  Digital Marketplace
                </p>
              </div>
            </button>

            {/* Mega Menu Dropdown Toggle */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                  isMegaMenuOpen
                    ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                <Folder className="w-4 h-4 text-sky-400" />
                <span>24 Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Menu Overlay */}
              {isMegaMenuOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-[850px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 grid grid-cols-12 gap-6 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setIsMegaMenuOpen(false)}
                >
                  {/* Category Column */}
                  <div className="col-span-5 border-r border-slate-800/80 pr-4 max-h-[460px] overflow-y-auto custom-scrollbar">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Marketplace Taxonomy
                    </p>
                    <div className="space-y-0.5">
                      {ALL_CATEGORIES.map((cat) => {
                        const IconComp = CATEGORY_ICON_MAP[cat.iconName] || Folder;
                        const isHovered = hoveredCat === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onMouseEnter={() => setHoveredCat(cat.id)}
                            onClick={() => {
                              onSelectCategory(cat.id);
                              setIsMegaMenuOpen(false);
                              onNavigate('marketplace');
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                              isHovered
                                ? 'bg-sky-500/20 text-sky-300 font-semibold'
                                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <IconComp className="w-4 h-4 text-sky-400 flex-shrink-0" />
                              <span className="truncate">{cat.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {cat.productCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subcategory Preview Column */}
                  <div className="col-span-7 flex flex-col justify-between">
                    {currentHoveredInfo && (
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div>
                            <h3 className="font-bold text-base text-white">
                              {currentHoveredInfo.name}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {currentHoveredInfo.description}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              onSelectCategory(currentHoveredInfo.id);
                              setIsMegaMenuOpen(false);
                              onNavigate('marketplace');
                            }}
                            className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Browse All
                          </button>
                        </div>

                        <div className="mt-4">
                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Included Subcategories
                          </p>
                          <div className="flex flex-wrap gap-1.5 max-h-[300px] overflow-y-auto">
                            {currentHoveredInfo.subcategories.map((subcat) => (
                              <button
                                key={subcat}
                                onClick={() => {
                                  onSelectCategory(currentHoveredInfo.id, subcat);
                                  setIsMegaMenuOpen(false);
                                  onNavigate('marketplace');
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-sky-500/20 hover:text-sky-300 text-slate-300 text-xs border border-slate-700/60 transition-colors cursor-pointer text-left"
                              >
                                {subcat}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span>Open Ocean Legal Digital Products Framework</span>
                      <button
                        onClick={() => {
                          onNavigate('governance');
                          setIsMegaMenuOpen(false);
                        }}
                        className="text-sky-400 hover:underline cursor-pointer"
                      >
                        License Matrix
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search eBooks, 3D assets, Notion templates, AI prompts, music..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Actions & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Assistant Button */}
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/40 text-purple-300 hover:text-white hover:border-purple-400 transition-all text-xs font-semibold shadow-sm cursor-pointer"
              title="Open Ocean Gemini AI Search Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">AI Finder</span>
            </button>

            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as Currency)}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-sky-500 cursor-pointer font-mono"
            >
              {Object.keys(CURRENCIES).map((c) => (
                <option key={c} value={c}>
                  {c} ({CURRENCIES[c as Currency].symbol})
                </option>
              ))}
            </select>

            {/* User-Controlled Theme Toggle */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all cursor-pointer text-xs font-semibold"
                title={`Switch to ${theme === 'dark' ? 'High-Contrast Light Mode' : 'Default Dark Theme'}`}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden xl:inline text-[11px]">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span className="hidden xl:inline text-[11px]">Dark Mode</span>
                  </>
                )}
              </button>
            )}

            {/* Sell / Creator Studio */}
            <button
              onClick={() => onNavigate('creator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                activeView === 'creator'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Sell Assets</span>
            </button>

            {/* My Purchases Vault */}
            <button
              onClick={() => onNavigate('library')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                activeView === 'library'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden lg:inline">My Vault</span>
            </button>

            {/* My Wishlist */}
            <button
              onClick={() => onNavigate('wishlist')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                activeView === 'wishlist'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
              title="My Wishlist"
            >
              <Heart className={`w-3.5 h-3.5 ${wishlistCount > 0 ? 'text-rose-400 fill-rose-500/30' : 'text-slate-400'}`} />
              <span className="hidden md:inline">My Wishlist</span>
              {wishlistCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Price Alerts Button */}
            {onOpenPriceAlerts && (
              <button
                onClick={onOpenPriceAlerts}
                className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Price Drop Alerts"
              >
                <Bell className={`w-4 h-4 ${triggeredAlertsCount > 0 ? 'text-amber-400 fill-amber-400/40 animate-bounce' : 'text-slate-400'}`} />
                {priceAlertsCount > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold border ${
                      triggeredAlertsCount > 0
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold'
                        : 'bg-amber-500 text-slate-950 border-amber-400'
                    }`}
                  >
                    {priceAlertsCount}
                  </span>
                )}
              </button>
            )}

            {/* Product Comparison Button */}
            {onOpenCompare && (
              <button
                onClick={onOpenCompare}
                className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title="Product Comparison Tool"
              >
                <ArrowRightLeft className={`w-4 h-4 ${compareCount > 0 ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="hidden xl:inline">Compare</span>
                {compareCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-sky-500 text-slate-950 border border-sky-400">
                    {compareCount}
                  </span>
                )}
              </button>
            )}

            {/* Payment History Ledger Button */}
            {onOpenPaymentHistory && (
              <button
                onClick={onOpenPaymentHistory}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title="Payment & UPI Transaction History"
              >
                <History className="w-4 h-4 text-emerald-400" />
                <span className="hidden xl:inline">Txn History</span>
              </button>
            )}

            {/* Cart Drawer Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-transform active:scale-95 cursor-pointer shadow-lg shadow-sky-500/20"
              title="View Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-slate-950">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
