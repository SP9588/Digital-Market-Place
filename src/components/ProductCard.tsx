import React from 'react';
import { DigitalProduct, Currency } from '../types/marketplace';
import { formatCurrency } from '../utils/currency';
import { Star, Download, ShieldCheck, ShoppingCart, Eye, Sparkles, Heart, ArrowRightLeft } from 'lucide-react';

interface ProductCardProps {
  product: DigitalProduct;
  currency: Currency;
  isWishlisted?: boolean;
  isComparing?: boolean;
  onSelectProduct: (product: DigitalProduct) => void;
  onAddToCart: (product: DigitalProduct) => void;
  onToggleWishlist?: (product: DigitalProduct) => void;
  onToggleCompare?: (product: DigitalProduct) => void;
  onMoveToCart?: (product: DigitalProduct) => void;
  onSelectTag?: (tag: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  isWishlisted = false,
  isComparing = false,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  onToggleCompare,
  onMoveToCart,
  onSelectTag,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-500/10 flex flex-col justify-between group">
      <div>
        {/* Thumbnail Preview Banner */}
        <div
          className="relative w-full h-48 bg-slate-950 overflow-hidden cursor-pointer"
          onClick={() => onSelectProduct(product)}
        >
          <img
            src={product.previewUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 pr-10">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-sky-400 border border-sky-500/30 backdrop-blur">
              {product.categoryName}
            </span>
            {product.isVerified && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>

          {/* Action Overlay Buttons: Compare & Wishlist */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            {onToggleCompare && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompare(product);
                }}
                className={`p-2 rounded-full backdrop-blur transition-all cursor-pointer border ${
                  isComparing
                    ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-lg shadow-sky-500/30 scale-105'
                    : 'bg-slate-950/70 text-slate-300 border-slate-700/60 hover:text-sky-400 hover:bg-slate-900/90'
                }`}
                title={isComparing ? 'Remove from Compare' : 'Add to Compare (Side-by-Side)'}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            )}

            {onToggleWishlist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(product);
                }}
                className={`p-2 rounded-full backdrop-blur transition-all cursor-pointer border ${
                  isWishlisted
                    ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30 scale-105'
                    : 'bg-slate-950/70 text-slate-300 border-slate-700/60 hover:text-rose-400 hover:bg-slate-900/90'
                }`}
                title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current text-white' : ''}`} />
              </button>
            )}
          </div>

          {/* Format Badge */}
          <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 text-[10px] font-mono border border-slate-700/80">
            {product.fileFormat.split(',')[0]}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="text-slate-400 truncate max-w-[150px]">{product.subcategory}</span>
            <div className="flex items-center gap-1 text-amber-400 font-semibold font-mono">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-500 font-normal">({product.reviewCount})</span>
            </div>
          </div>

          <h3
            onClick={() => onSelectProduct(product)}
            className="font-bold text-sm text-slate-100 hover:text-sky-400 transition-colors line-clamp-2 cursor-pointer mb-2 min-h-[40px]"
          >
            {product.title}
          </h3>

          {/* Creator Details */}
          <div className="flex items-center justify-between gap-2 py-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={product.creatorAvatar}
                alt={product.creatorName}
                className="w-5 h-5 rounded-full object-cover border border-slate-700 shrink-0"
              />
              <span className="text-xs text-slate-300 truncate font-medium">{product.creatorName}</span>
            </div>
          </div>

          {/* Product Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-slate-800/50">
              {product.tags.slice(0, 3).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTag?.(t);
                  }}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-950 hover:text-sky-300 hover:bg-slate-800 transition-colors cursor-pointer border border-slate-800/80"
                >
                  #{t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Pricing & CTA */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Instant Download</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-white font-mono">
              {formatCurrency(product.salePrice || product.price, currency)}
            </span>
            {product.salePrice && (
              <span className="text-xs text-slate-500 line-through font-mono">
                {formatCurrency(product.price, currency)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSelectProduct(product)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Quick View & Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          {onMoveToCart ? (
            <button
              onClick={() => onMoveToCart(product)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md shadow-emerald-400/10 active:scale-95"
              title="Move to Shopping Cart and remove from Wishlist"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Move to Cart</span>
            </button>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md shadow-sky-500/10 active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
