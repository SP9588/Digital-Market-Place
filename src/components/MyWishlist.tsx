import React, { useState, useMemo } from 'react';
import { DigitalProduct, Currency } from '../types/marketplace';
import { ProductCard } from './ProductCard';
import { formatCurrency } from '../utils/currency';
import {
  Heart,
  ShoppingCart,
  Compass,
  Trash2,
  ArrowRightLeft,
  Share2,
  Copy,
  Check,
  X,
  ExternalLink,
  Sparkles,
  MessageCircle,
  Send,
  CheckCircle2,
  Filter,
  Layers,
} from 'lucide-react';

interface MyWishlistProps {
  wishlistProducts: DigitalProduct[];
  currency: Currency;
  comparedProductIds?: string[];
  onSelectProduct: (product: DigitalProduct) => void;
  onAddToCart: (product: DigitalProduct) => void;
  onToggleWishlist: (product: DigitalProduct) => void;
  onToggleCompare?: (product: DigitalProduct) => void;
  onClearWishlist: () => void;
  onExploreMore: () => void;
}

export const MyWishlist: React.FC<MyWishlistProps> = ({
  wishlistProducts,
  currency,
  comparedProductIds = [],
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  onToggleCompare,
  onClearWishlist,
  onExploreMore,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Extract unique categories present in the user's wishlist
  const categoryFilters = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    wishlistProducts.forEach((p) => {
      const existing = map.get(p.categoryId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(p.categoryId, {
          id: p.categoryId,
          name: p.categoryName,
          count: 1,
        });
      }
    });
    return Array.from(map.values());
  }, [wishlistProducts]);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return wishlistProducts;
    return wishlistProducts.filter((p) => p.categoryId === selectedCategory);
  }, [wishlistProducts, selectedCategory]);

  // Reset filter to 'all' if selected category is no longer present
  if (
    selectedCategory !== 'all' &&
    !categoryFilters.some((c) => c.id === selectedCategory)
  ) {
    setSelectedCategory('all');
  }

  // Calculate wishlist total value
  const totalValue = wishlistProducts.reduce(
    (sum, p) => sum + (p.salePrice || p.price),
    0
  );

  // Generate shareable URL
  const wishlistIdsParam = wishlistProducts.map((p) => p.id).join(',');
  const shareableUrl = `${window.location.origin}${window.location.pathname}?wishlist=${encodeURIComponent(
    wishlistIdsParam
  )}`;

  // Formatted text for copying
  const formattedSummaryText = `My Open Ocean Wishlist (${wishlistProducts.length} Assets - ${formatCurrency(
    totalValue,
    currency
  )}):\n` +
    wishlistProducts
      .map((p, idx) => `${idx + 1}. ${p.title} - ${formatCurrency(p.salePrice || p.price, currency)}`)
      .join('\n') +
    `\n\nView Wishlist: ${shareableUrl}`;

  // Handle Move Single Item to Cart
  const handleMoveToCart = (product: DigitalProduct) => {
    onAddToCart(product);
    onToggleWishlist(product);
    showNotice(`Moved "${product.title}" to cart!`);
  };

  // Handle Move All to Cart
  const handleMoveAllToCart = () => {
    if (wishlistProducts.length === 0) return;
    const itemsToMove = [...wishlistProducts];
    itemsToMove.forEach((product) => {
      onAddToCart(product);
      onToggleWishlist(product);
    });
    showNotice(`Moved ${itemsToMove.length} item${itemsToMove.length > 1 ? 's' : ''} to cart!`);
  };

  // Handle Add All to Cart (keep in wishlist)
  const handleAddAllToCart = () => {
    if (wishlistProducts.length === 0) return;
    wishlistProducts.forEach((product) => {
      onAddToCart(product);
    });
    showNotice(`Added ${wishlistProducts.length} item${wishlistProducts.length > 1 ? 's' : ''} to cart!`);
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Copy share link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Copy formatted text
  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(formattedSummaryText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  // Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Open Ocean Wishlist',
          text: `Check out my saved digital assets on Open Ocean (${wishlistProducts.length} items)!`,
          url: shareableUrl,
        });
      } catch (err) {
        console.log('Share error or canceled', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-emerald-300 border border-emerald-500/40 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-rose-950/80 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current" /> Saved Items
            </span>
            <span className="text-xs text-slate-400">• Personal Collection</span>
          </div>
          <h1 className="text-2xl font-black text-white">My Wishlist</h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
            Keep track of digital goods, software templates, 3D models, and eBook assets you want to buy later or share with colleagues.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase text-slate-400 block font-semibold">Saved Items</span>
            <span className="text-lg font-black font-mono text-rose-400">
              {wishlistProducts.length}
            </span>
          </div>

          <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase text-slate-400 block font-semibold">Total Value</span>
            <span className="text-lg font-black font-mono text-sky-400">
              {formatCurrency(totalValue, currency)}
            </span>
          </div>

          {wishlistProducts.length > 0 && (
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-md hover:border-slate-600"
              title="Share Wishlist Link"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Share Wishlist</span>
            </button>
          )}

          {wishlistProducts.length > 0 && (
            <button
              onClick={onClearWishlist}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              title="Clear all saved wishlist items"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Wishlist Items Content */}
      {wishlistProducts.length > 0 ? (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          {categoryFilters.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold pr-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-sky-400" />
                <span>Filter:</span>
              </div>

              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-md shadow-sky-500/20'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>All Categories</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    selectedCategory === 'all'
                      ? 'bg-slate-950/20 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {wishlistProducts.length}
                </span>
              </button>

              {categoryFilters.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-md shadow-sky-500/20'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      selectedCategory === cat.id
                        ? 'bg-slate-950/20 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
            <div>
              <p className="text-xs font-semibold text-slate-300">
                Showing {filteredProducts.length} {selectedCategory !== 'all' ? 'filtered' : 'saved'} product{filteredProducts.length !== 1 ? 's' : ''}
                {selectedCategory !== 'all' && ` in ${categoryFilters.find(c => c.id === selectedCategory)?.name}`}
              </p>
              <p className="text-[11px] text-slate-500">
                Move items to your cart when you're ready to checkout or share your collection.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleMoveAllToCart}
                className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-400/10 active:scale-95"
                title="Transfer all wishlist items into shopping cart and empty wishlist"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Move All to Cart</span>
              </button>

              <button
                onClick={handleAddAllToCart}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-700"
                title="Add copies of all wishlist items to cart"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add All to Cart</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={currency}
                isWishlisted={true}
                isComparing={comparedProductIds.includes(product.id)}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                onToggleCompare={onToggleCompare}
                onMoveToCart={handleMoveToCart}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
            <Heart className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Your Wishlist is Empty</h3>
            <p className="text-xs text-slate-400 mt-1">
              Explore Open Ocean's digital marketplace and click the heart icon on any product card to save items for later.
            </p>
          </div>

          <button
            onClick={onExploreMore}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-sky-500/20"
          >
            <Compass className="w-4 h-4" />
            <span>Browse Digital Marketplace</span>
          </button>
        </div>
      )}

      {/* Share Wishlist Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Share Wishlist</h3>
                  <p className="text-[11px] text-slate-400">Share your curated digital assets list</p>
                </div>
              </div>

              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Collection Stats Summary */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Wishlisted Items</span>
                <span className="font-bold text-white">{wishlistProducts.length} Assets</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Value</span>
                <span className="font-mono font-bold text-sky-400">{formatCurrency(totalValue, currency)}</span>
              </div>
            </div>

            {/* Direct Link Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Wishlist Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                    copiedLink
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-sky-500 hover:bg-sky-400 text-slate-950 border-sky-400'
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Formatted Text Copy */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Text Summary</label>
                <button
                  onClick={handleCopySummary}
                  className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedText ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Summary Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Copy className="w-3 h-3" /> Copy Summary Text
                    </span>
                  )}
                </button>
              </div>
              <textarea
                readOnly
                rows={3}
                value={formattedSummaryText}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-400 font-mono focus:outline-none resize-none"
              />
            </div>

            {/* Quick Share Platforms */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Quick Share
              </span>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Check out my digital asset wishlist on Open Ocean (${wishlistProducts.length} items):`
                  )}&url=${encodeURIComponent(shareableUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span>Share on X / Twitter</span>
                </a>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `My Open Ocean Wishlist: ${shareableUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Share on WhatsApp</span>
                </a>
              </div>

              {navigator.share && (
                <button
                  onClick={handleNativeShare}
                  className="w-full mt-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>More Share Options</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
