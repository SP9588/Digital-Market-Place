import React, { useState, useEffect } from 'react';
import { DigitalProduct, LicenseType, Currency, PriceAlert, Review, ProductBundle } from '../types/marketplace';
import { formatCurrency, convertPrice } from '../utils/currency';
import { AudioWaveformPlayer } from './InteractivePreviews/AudioWaveformPlayer';
import { ThreeDViewer } from './InteractivePreviews/ThreeDViewer';
import { CodePromptViewer } from './InteractivePreviews/CodePromptViewer';
import { PresetCompareSlider } from './InteractivePreviews/PresetCompareSlider';
import { PdfPreviewer } from './InteractivePreviews/PdfPreviewer';
import { GiftCardConfigurator } from './InteractivePreviews/GiftCardConfigurator';
import {
  X,
  Star,
  CheckCircle2,
  ShieldCheck,
  Download,
  FileCode,
  Layers,
  Sparkles,
  ShoppingCart,
  MessageSquare,
  UserCheck,
  Share2,
  Heart,
  Bell,
  Check,
  Trash2,
  TrendingDown,
  Edit3,
  RotateCcw,
  Tag,
  DollarSign,
  ArrowRightLeft,
  Package,
  Plus,
  Percent,
  ShoppingBag,
  CheckSquare,
  Square,
  ArrowRight,
  Copy,
  ExternalLink,
  Mail,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: DigitalProduct | null;
  allProducts?: DigitalProduct[];
  currency: Currency;
  isWishlisted?: boolean;
  isComparing?: boolean;
  existingAlert?: PriceAlert;
  reviews?: Review[];
  bundles?: ProductBundle[];
  hasPurchased?: boolean;
  onClose: () => void;
  onAddToCart: (product: DigitalProduct, license: LicenseType, customPriceUsd?: number) => void;
  onDirectCheckout: (product: DigitalProduct, license: LicenseType, customPriceUsd?: number) => void;
  onAddBundleToCart?: (items: DigitalProduct[], discountPercentage: number) => void;
  onToggleWishlist?: (product: DigitalProduct) => void;
  onToggleCompare?: (product: DigitalProduct) => void;
  onSavePriceAlert?: (product: DigitalProduct, targetPriceUsd: number) => void;
  onDeletePriceAlert?: (productId: string) => void;
  onSelectProduct?: (product: DigitalProduct) => void;
  onAddReview?: (review: Omit<Review, 'id' | 'date'>) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts = [],
  currency,
  isWishlisted = false,
  isComparing = false,
  existingAlert,
  reviews = [],
  bundles = [],
  hasPurchased = false,
  onClose,
  onAddToCart,
  onDirectCheckout,
  onAddBundleToCart,
  onToggleWishlist,
  onToggleCompare,
  onSavePriceAlert,
  onDeletePriceAlert,
  onSelectProduct,
  onAddReview,
}) => {
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('personal');
  const [activeTab, setActiveTab] = useState<'overview' | 'bundle' | 'specs' | 'reviews'>('overview');
  const [isPriceAlertBoxOpen, setIsPriceAlertBoxOpen] = useState(false);
  const [isShareBoxOpen, setIsShareBoxOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Helper to generate deep link URL for current product
  const getShareUrl = () => {
    if (!product) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    return `${origin}${pathname}?product=${encodeURIComponent(product.id)}`;
  };

  const handleCopyShareLink = () => {
    const url = getShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      }).catch(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      });
    } else {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const handleNativeShare = async () => {
    if (!product) return;
    const url = getShareUrl();
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} by ${product.creatorName} on Open Ocean!`,
          url: url,
        });
      } catch (err) {
        console.log('Share dismissed or failed:', err);
      }
    } else {
      handleCopyShareLink();
    }
  };

  // Custom Editable Price state
  const [isCustomPriceActive, setIsCustomPriceActive] = useState<boolean>(true);
  const [customPriceInput, setCustomPriceInput] = useState<string>('10');

  // Current product price converted to user currency
  const currentPriceUsd = product ? (product.salePrice || product.price) : 0;
  const currentPriceInCurrency = convertPrice(currentPriceUsd, currency);

  const [targetPriceInput, setTargetPriceInput] = useState<string>('');
  const [alertSuccessNotice, setAlertSuccessNotice] = useState<string | null>(null);

  // Review Form & Filter States
  const [newRating, setNewRating] = useState<number>(5);
  const [newHoverRating, setNewHoverRating] = useState<number>(0);
  const [newUserName, setNewUserName] = useState<string>(hasPurchased ? 'Verified Buyer' : 'Alex M.');
  const [newComment, setNewComment] = useState<string>('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);
  const [reviewErrorMsg, setReviewErrorMsg] = useState<string | null>(null);
  const [reviewFilterRating, setReviewFilterRating] = useState<number | 'all'>('all');
  const [reviewSort, setReviewSort] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});

  const productReviews = React.useMemo(() => {
    if (!product || !reviews) return [];
    return reviews.filter((r) => r.productId === product.id);
  }, [product, reviews]);

  const displayReviews = React.useMemo(() => {
    let list = [...productReviews];
    if (reviewFilterRating !== 'all') {
      list = list.filter((r) => Math.round(r.rating) === reviewFilterRating);
    }
    if (reviewSort === 'newest') {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (reviewSort === 'highest') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (reviewSort === 'lowest') {
      list.sort((a, b) => a.rating - b.rating);
    }
    return list;
  }, [productReviews, reviewFilterRating, reviewSort]);

  // Curated Bundles matching current product
  const matchingCuratedBundles = React.useMemo(() => {
    if (!product || !bundles || bundles.length === 0) return [];
    return bundles.filter((b) => b.productIds.includes(product.id));
  }, [product, bundles]);

  // Dynamic Bundle Products fallback calculation
  const relatedProducts = React.useMemo(() => {
    if (!product || !allProducts || allProducts.length === 0) return [];
    const sameCat = allProducts.filter(
      (p) => p.id !== product.id && p.categoryId === product.categoryId
    );
    if (sameCat.length >= 2) return sameCat.slice(0, 2);
    const rest = allProducts.filter(
      (p) => p.id !== product.id && !sameCat.some((sc) => sc.id === p.id)
    );
    return [...sameCat, ...rest].slice(0, 2);
  }, [product, allProducts]);

  const bundleProducts = React.useMemo(() => {
    if (!product) return [];
    return [product, ...relatedProducts];
  }, [product, relatedProducts]);

  const [selectedBundleProductIds, setSelectedBundleProductIds] = useState<string[]>([]);
  const [bundleSuccessMsg, setBundleSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (bundleProducts.length > 0) {
      setSelectedBundleProductIds(bundleProducts.map((p) => p.id));
    }
  }, [product, relatedProducts]);

  const checkedBundleProducts = bundleProducts.filter((p) =>
    selectedBundleProductIds.includes(p.id)
  );

  const totalRegularUsd = checkedBundleProducts.reduce(
    (sum, p) => sum + (p.salePrice || p.price),
    0
  );

  const isBundleEligible = checkedBundleProducts.length >= 2;
  const bundleDiscountRate = isBundleEligible ? 0.20 : 0; // 20% discount if 2 or more products selected
  const totalBundleUsd = totalRegularUsd * (1 - bundleDiscountRate);
  const bundleSavingsUsd = totalRegularUsd - totalBundleUsd;

  const handleToggleBundleProduct = (id: string) => {
    setSelectedBundleProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddBundleToCart = () => {
    if (checkedBundleProducts.length === 0) return;

    if (onAddBundleToCart) {
      onAddBundleToCart(checkedBundleProducts, isBundleEligible ? 20 : 0);
    } else {
      checkedBundleProducts.forEach((p) => {
        const regPrice = p.salePrice || p.price;
        const finalDiscPrice = isBundleEligible ? regPrice * 0.8 : regPrice;
        onAddToCart(p, 'personal', finalDiscPrice);
      });
    }

    setBundleSuccessMsg(`Added ${checkedBundleProducts.length} bundle assets to cart with 20% savings!`);
    setTimeout(() => setBundleSuccessMsg(null), 3000);
  };

  const handleAddCuratedBundleToCart = (bundle: ProductBundle) => {
    const items = allProducts.filter((p) => bundle.productIds.includes(p.id));
    if (items.length === 0) return;

    if (onAddBundleToCart) {
      onAddBundleToCart(items, bundle.discountPercentage);
    } else {
      items.forEach((item) => {
        const regPrice = item.salePrice || item.price;
        const discPrice = regPrice * (1 - bundle.discountPercentage / 100);
        onAddToCart(item, 'personal', discPrice);
      });
    }

    setBundleSuccessMsg(`Added ${bundle.title} (${bundle.discountPercentage}% OFF) to your shopping cart!`);
    setTimeout(() => setBundleSuccessMsg(null), 3500);
  };


  useEffect(() => {
    if (product) {
      // Default custom price set to Rupees 10 (or equivalent converted in user currency)
      const defaultRupeeTenValue = currency === 'INR' ? '10' : (10 / 83.0 * convertPrice(1, currency)).toFixed(2);
      setCustomPriceInput(defaultRupeeTenValue);

      if (existingAlert) {
        const alertInCurrency = convertPrice(existingAlert.targetPrice, currency);
        setTargetPriceInput(alertInCurrency.toString());
      } else {
        // default target is 15% discount off current price
        const defaultTarget = Math.round(currentPriceInCurrency * 0.85 * 100) / 100;
        setTargetPriceInput(defaultTarget.toString());
      }
    }
  }, [product, existingAlert, currency]);

  if (!product) return null;

  const currentLicenseObj =
    product.licenses.find((l) => l.type === selectedLicense) || product.licenses[0];

  const standardPriceInCurrency = convertPrice(currentLicenseObj.price, currency);
  const parsedCustomAmount = parseFloat(customPriceInput);
  const isValidCustomPrice = !isNaN(parsedCustomAmount) && parsedCustomAmount > 0;

  const effectivePriceUsd =
    isCustomPriceActive && isValidCustomPrice
      ? convertPrice(parsedCustomAmount, 'USD', currency)
      : currentLicenseObj.price;

  const effectivePriceInCurrency =
    isCustomPriceActive && isValidCustomPrice
      ? parsedCustomAmount
      : standardPriceInCurrency;

  const renderPreviewComponent = () => {
    switch (product.previewType) {
      case 'audio':
        return (
          <AudioWaveformPlayer
            title={product.title}
            creator={product.creatorName}
            sampleUrl={product.audioSampleUrl}
          />
        );
      case '3d':
        return <ThreeDViewer title={product.title} modelType={product.model3dType} />;
      case 'code':
        return (
          <CodePromptViewer
            title={product.title}
            codeSnippet={product.codeSnippet}
            isAiPrompt={product.categoryId === 'ai_products'}
          />
        );
      case 'preset':
        return (
          <PresetCompareSlider
            title={product.title}
            beforeUrl={product.beforeAfterImages?.before || product.previewUrl}
            afterUrl={product.beforeAfterImages?.after || product.previewUrl}
          />
        );
      case 'pdf':
        return <PdfPreviewer title={product.title} samplePages={product.pdfSamplePages} />;
      case 'giftcard':
        return (
          <GiftCardConfigurator
            title={product.title}
            brandName={product.giftCardBrand}
            price={product.price}
            currency={currency}
          />
        );
      default:
        return (
          <div className="relative w-full h-72 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            <img src={product.previewUrl} alt={product.title} className="w-full h-full object-cover" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl text-slate-100 max-h-[90vh] flex flex-col my-auto">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30">
              {product.categoryName}
            </span>
            <span className="text-xs text-slate-400">• {product.subcategory}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareBoxOpen(!isShareBoxOpen)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isShareBoxOpen
                  ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-sky-400 border-slate-700 hover:text-white'
              }`}
              title="Share Product with others"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Asset</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Interactive Preview & Specs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Main Interactive Preview */}
              <div>{renderPreviewComponent()}</div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 text-xs font-semibold gap-4 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2 transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'border-b-2 border-sky-400 text-sky-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Overview & Features
                </button>

                {bundleProducts.length >= 2 && (
                  <button
                    onClick={() => setActiveTab('bundle')}
                    className={`pb-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 font-bold ${
                      activeTab === 'bundle'
                        ? 'border-b-2 border-amber-400 text-amber-400'
                        : 'text-slate-400 hover:text-amber-300'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    <span>Frequently Bought Together</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                      Save 20%
                    </span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2 transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'specs'
                      ? 'border-b-2 border-sky-400 text-sky-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  File Specifications
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'reviews'
                      ? 'border-b-2 border-sky-400 text-sky-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Verified Reviews ({product.reviewCount})
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-extrabold text-white">{product.title}</h2>
                  <p className="text-xs text-slate-300 leading-relaxed">{product.description}</p>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">
                      Key Highlights Included
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                      {product.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bundle Teaser inside Overview */}
                  {bundleProducts.length >= 2 && (
                    <div className="p-4 bg-gradient-to-r from-amber-950/30 via-slate-950 to-slate-950 rounded-xl border border-amber-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-xs text-amber-300">Frequently Bought Together</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Bundle Discount: 20% OFF
                        </span>
                      </div>

                      <div className="flex items-center gap-2 overflow-x-auto py-1">
                        {bundleProducts.map((bProd, idx) => (
                          <React.Fragment key={bProd.id}>
                            <div className="relative w-16 h-16 rounded-lg bg-slate-900 border border-slate-800 shrink-0 overflow-hidden group">
                              <img src={bProd.previewUrl} alt={bProd.title} className="w-full h-full object-cover" />
                              {bProd.id === product.id && (
                                <span className="absolute bottom-0 inset-x-0 bg-sky-500/90 text-slate-950 text-[8px] font-extrabold text-center py-0.5">
                                  This item
                                </span>
                              )}
                            </div>
                            {idx < bundleProducts.length - 1 && (
                              <Plus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                        <div>
                          <span className="text-slate-400 text-[11px] block">Bundle Price ({bundleProducts.length} items):</span>
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono font-bold text-amber-400 text-sm">
                              {formatCurrency(totalBundleUsd, currency)}
                            </span>
                            <span className="font-mono text-slate-500 line-through text-[11px]">
                              {formatCurrency(totalRegularUsd, currency)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveTab('bundle')}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Customize Bundle</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dedicated Bundle Offers Tab */}
              {activeTab === 'bundle' && (
                <div className="space-y-6">
                  {/* Curated Bundle Offers Section */}
                  {matchingCuratedBundles.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <h3 className="font-extrabold text-sm text-white">Curated Bundle Offers</h3>
                        </div>
                        <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          Exclusive Pre-packaged Deals
                        </span>
                      </div>

                      {matchingCuratedBundles.map((b) => {
                        const bundleItems = allProducts.filter((p) => b.productIds.includes(p.id));
                        const origTotalUsd = bundleItems.reduce(
                          (acc, p) => acc + (p.salePrice || p.price),
                          0
                        );
                        const discTotalUsd = origTotalUsd * (1 - b.discountPercentage / 100);
                        const totalSavedUsd = origTotalUsd - discTotalUsd;

                        return (
                          <div
                            key={b.id}
                            className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-4 relative overflow-hidden group shadow-lg"
                          >
                            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  {b.badge && (
                                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                                      {b.badge}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-emerald-400 font-bold">
                                    {b.discountPercentage}% Instant Savings
                                  </span>
                                </div>
                                <h4 className="font-bold text-sm text-white">{b.title}</h4>
                                <p className="text-xs text-slate-400 mt-1">{b.description}</p>
                              </div>

                              <div className="text-right font-mono shrink-0">
                                <span className="text-lg font-black text-amber-400 block">
                                  {formatCurrency(discTotalUsd, currency)}
                                </span>
                                <span className="text-xs text-slate-500 line-through block">
                                  {formatCurrency(origTotalUsd, currency)}
                                </span>
                              </div>
                            </div>

                            {/* Bundle items list */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {bundleItems.map((item) => (
                                <div
                                  key={item.id}
                                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center gap-2.5"
                                >
                                  <img
                                    src={item.previewUrl}
                                    alt={item.title}
                                    className="w-10 h-10 rounded-md object-cover border border-slate-800 shrink-0"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-xs text-white truncate">{item.title}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                      <span>{item.categoryName}</span>
                                      <span className="font-mono text-emerald-400 font-semibold">
                                        {formatCurrency(
                                          (item.salePrice || item.price) *
                                            (1 - b.discountPercentage / 100),
                                          currency
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                              <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                                <Percent className="w-3.5 h-3.5" />
                                You save {formatCurrency(totalSavedUsd, currency)} with this bundle!
                              </span>

                              <button
                                onClick={() => handleAddCuratedBundleToCart(b)}
                                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-95"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Add Bundle Offer to Cart</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Dynamic Custom Bundle Builder */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                          <Package className="w-4 h-4 text-amber-400" />
                          <span>Custom Digital Asset Bundle Builder</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Combine this item with complementary digital assets and receive an instant 20% discount across all selected items!
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        20% OFF
                      </span>
                    </div>

                    {/* Bundle Items Checklist */}
                    <div className="space-y-3">
                      {bundleProducts.map((bProd) => {
                        const isChecked = selectedBundleProductIds.includes(bProd.id);
                        const regPrice = bProd.salePrice || bProd.price;
                        const discPrice = regPrice * 0.8;

                        return (
                          <div
                            key={bProd.id}
                            onClick={() => handleToggleBundleProduct(bProd.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isChecked
                                ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                                : 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                type="button"
                                className="text-amber-400 cursor-pointer shrink-0"
                              >
                                {isChecked ? (
                                  <CheckSquare className="w-5 h-5 text-amber-400" />
                                ) : (
                                  <Square className="w-5 h-5 text-slate-600" />
                                )}
                              </button>

                              <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                                <img
                                  src={bProd.previewUrl}
                                  alt={bProd.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  {bProd.id === product.id && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                                      Main Item
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                                    {bProd.categoryName}
                                  </span>
                                </div>

                                <h4
                                  onClick={(e) => {
                                    if (onSelectProduct && bProd.id !== product.id) {
                                      e.stopPropagation();
                                      onSelectProduct(bProd);
                                    }
                                  }}
                                  className="font-bold text-xs text-white line-clamp-1 hover:text-sky-300"
                                >
                                  {bProd.title}
                                </h4>
                                <span className="text-[10px] text-slate-400">By {bProd.creatorName}</span>
                              </div>
                            </div>

                            <div className="text-right shrink-0 font-mono">
                              <span className="font-bold text-xs text-amber-300 block">
                                {formatCurrency(isBundleEligible ? discPrice : regPrice, currency)}
                              </span>
                              {isBundleEligible && (
                                <span className="text-[10px] text-slate-500 line-through block">
                                  {formatCurrency(regPrice, currency)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bundle Price Summary Card */}
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          Selected Custom Bundle ({checkedBundleProducts.length} of {bundleProducts.length}):
                        </span>

                        <div className="text-right font-mono">
                          <div className="flex items-baseline gap-2 justify-end">
                            <span className="text-lg font-black text-amber-400">
                              {formatCurrency(totalBundleUsd, currency)}
                            </span>
                            {isBundleEligible && (
                              <span className="text-xs text-slate-500 line-through">
                                {formatCurrency(totalRegularUsd, currency)}
                              </span>
                            )}
                          </div>

                          {isBundleEligible && (
                            <span className="text-[10px] text-emerald-400 font-bold block">
                              You Save {formatCurrency(bundleSavingsUsd, currency)} (20% OFF)
                            </span>
                          )}
                        </div>
                      </div>

                      {bundleSuccessMsg && (
                        <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs text-center font-bold animate-in fade-in">
                          ✓ {bundleSuccessMsg}
                        </div>
                      )}

                      <button
                        onClick={handleAddBundleToCart}
                        disabled={checkedBundleProducts.length === 0}
                        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>
                          Add Selected Custom Bundle ({checkedBundleProducts.length} Items) to Cart
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}


              {activeTab === 'specs' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                  <h4 className="font-bold text-sky-400 uppercase tracking-wider mb-2">
                    Digital Asset File Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">File Format</span>
                      <span className="font-mono text-slate-200 font-bold">{product.fileFormat}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">File Archive Size</span>
                      <span className="font-mono text-slate-200 font-bold">{product.fileSize}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Total Downloads</span>
                      <span className="font-mono text-slate-200 font-bold">{product.downloadCount}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Date Added</span>
                      <span className="font-mono text-slate-200 font-bold">{product.dateAdded}</span>
                    </div>
                  </div>

                  {Object.keys(product.attributes).length > 0 && (
                    <div className="pt-3 border-t border-slate-800">
                      <p className="font-semibold text-slate-300 mb-2">Additional Metadata</p>
                      <div className="space-y-1">
                        {Object.entries(product.attributes).map(([key, val]) => (
                          <div key={key} className="flex justify-between py-1 border-b border-slate-900">
                            <span className="text-slate-400">{key}:</span>
                            <span className="text-slate-200 font-mono">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-5">
                  {/* Rating Header & Summary */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center pr-4 border-r border-slate-800">
                        <span className="text-3xl font-black text-amber-400 font-mono">
                          {product.rating.toFixed(1)}
                        </span>
                        <div className="flex text-amber-400 justify-center my-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= Math.round(product.rating)
                                  ? 'fill-current'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {productReviews.length} total reviews
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">Customer Reviews & Ratings</h4>
                          {hasPurchased && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified Buyer</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Real feedback from creators who integrated this asset into their projects.
                        </p>
                      </div>
                    </div>

                    {/* Rating Distribution Bars */}
                    <div className="w-full md:w-44 space-y-1 text-[11px] font-mono">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = productReviews.filter(
                          (r) => Math.round(r.rating) === stars
                        ).length;
                        const pct =
                          productReviews.length > 0
                            ? (count / productReviews.length) * 100
                            : 0;
                        return (
                          <div key={stars} className="flex items-center gap-2 text-slate-400">
                            <span className="w-3 text-right text-xs">{stars}★</span>
                            <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-6 text-right text-[10px] text-slate-500">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Leave a Review Form Box */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-sky-400" />
                        <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                          Leave a Star Rating & Review
                        </h4>
                      </div>
                      {hasPurchased ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          Verified Purchase Eligible
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          Purchased items earn Verified Buyer badge
                        </span>
                      )}
                    </div>

                    {reviewSuccessMsg && (
                      <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{reviewSuccessMsg}</span>
                      </div>
                    )}

                    {reviewErrorMsg && (
                      <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-lg text-rose-300 text-xs font-semibold">
                        {reviewErrorMsg}
                      </div>
                    )}

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setReviewErrorMsg(null);
                        if (!newComment.trim()) {
                          setReviewErrorMsg(
                            'Please write a comment describing your experience before submitting.'
                          );
                          return;
                        }
                        if (onAddReview) {
                          onAddReview({
                            productId: product.id,
                            userName:
                              newUserName.trim() ||
                              (hasPurchased ? 'Verified Buyer' : 'Open Ocean User'),
                            userAvatar:
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
                            rating: newRating,
                            comment: newComment.trim(),
                            verifiedPurchase: hasPurchased || false,
                          });
                          setNewComment('');
                          setReviewSuccessMsg(
                            'Thank you! Your review and rating have been published.'
                          );
                          setTimeout(() => setReviewSuccessMsg(null), 5000);
                        }
                      }}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Your Star Rating
                          </label>
                          <div className="flex items-center gap-1 bg-slate-900 p-2 rounded-lg border border-slate-800">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const isHighlighted =
                                (newHoverRating || newRating) >= star;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onMouseEnter={() => setNewHoverRating(star)}
                                  onMouseLeave={() => setNewHoverRating(0)}
                                  onClick={() => setNewRating(star)}
                                  className="p-1 transition-transform hover:scale-125 cursor-pointer"
                                  title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                >
                                  <Star
                                    className={`w-5 h-5 ${
                                      isHighlighted
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-slate-600'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                            <span className="text-xs font-bold text-amber-400 font-mono ml-2">
                              {newRating} / 5 Stars
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Author Name
                          </label>
                          <input
                            type="text"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            placeholder="Your name or handle"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Written Review
                        </label>
                        <textarea
                          rows={3}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share details about file quality, setup ease, documentation, performance..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Publish Review</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Filter & Sort Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      <span className="text-slate-400 font-semibold mr-1 shrink-0">
                        Filter:
                      </span>
                      <button
                        onClick={() => setReviewFilterRating('all')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                          reviewFilterRating === 'all'
                            ? 'bg-sky-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        All ({productReviews.length})
                      </button>
                      {[5, 4, 3, 2, 1].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewFilterRating(star)}
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-0.5 ${
                            reviewFilterRating === star
                              ? 'bg-amber-400 text-slate-950 font-bold'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          <span>{star}</span>
                          <Star className="w-3 h-3 fill-current" />
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-400 font-semibold">Sort:</span>
                      <select
                        value={reviewSort}
                        onChange={(e) => setReviewSort(e.target.value as any)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                      >
                        <option value="newest">Newest First</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                      </select>
                    </div>
                  </div>

                  {/* Reviews List */}
                  {displayReviews.length > 0 ? (
                    <div className="space-y-3">
                      {displayReviews.map((rev) => {
                        const votes = helpfulVotes[rev.id] || 0;
                        return (
                          <div
                            key={rev.id}
                            className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs transition-all hover:border-slate-700"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={rev.userAvatar}
                                  alt={rev.userName}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-800 shrink-0"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{rev.userName}</span>
                                    {rev.verifiedPurchase && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                        <span>Verified Buyer</span>
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {rev.date}
                                  </span>
                                </div>
                              </div>

                              <div className="flex text-amber-400 shrink-0">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3.5 h-3.5 ${
                                      star <= rev.rating
                                        ? 'fill-current'
                                        : 'text-slate-800'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <p className="text-slate-300 leading-relaxed pl-10">{rev.comment}</p>

                            <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 pl-10">
                              <span>Open Ocean Verified Feedback</span>
                              <button
                                onClick={() =>
                                  setHelpfulVotes((prev) => ({
                                    ...prev,
                                    [rev.id]: (prev[rev.id] || 0) + 1,
                                  }))
                                }
                                className="hover:text-sky-400 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <span>Helpful?</span>
                                <span className="font-bold text-slate-400 font-mono">
                                  ({votes})
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2">
                      <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="font-bold text-white text-xs">No Reviews Match Selected Criteria</p>
                      <p className="text-slate-400 text-[11px]">
                        Be the first to share feedback for this digital asset using the review form above!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: License Matrix & Checkout Action */}
            <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">
                  Select License Tier
                </h3>

                {/* License Options Radio Stack */}
                <div className="space-y-2.5">
                  {product.licenses.map((lic) => {
                    const isSelected = selectedLicense === lic.type;
                    return (
                      <div
                        key={lic.type}
                        onClick={() => setSelectedLicense(lic.type)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-sky-500/10 border-sky-400 shadow-lg shadow-sky-500/10'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-white">{lic.name}</span>
                          <span className="font-mono text-base font-black text-sky-400">
                            {formatCurrency(lic.price, currency)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{lic.description}</p>

                        <ul className="space-y-1 text-[11px] text-slate-300">
                          {lic.features.map((f, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Creator Card */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={product.creatorAvatar}
                    alt={product.creatorName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <span className="font-bold text-xs text-white block">{product.creatorName}</span>
                    <span className="text-[10px] text-slate-400">
                      ★ {product.creatorRating} ({product.creatorSales} sales)
                    </span>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-slate-800 text-sky-400 text-[10px] font-semibold border border-slate-700">
                  Top Seller
                </span>
              </div>

              {/* Total & Action Buttons */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                {/* Editable / Customizable Offer Price Box */}
                <div className="p-3.5 bg-slate-950/90 rounded-xl border border-sky-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                      <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                      <span>Customizable / Editable Price</span>
                    </div>
                    <span className="text-[10px] bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded-md font-mono border border-sky-500/20">
                      Default: ₹10 (Rupees 10)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsCustomPriceActive(false)}
                      className={`py-1.5 px-2 rounded-md text-[11px] font-semibold transition-all cursor-pointer text-center ${
                        !isCustomPriceActive
                          ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Standard
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomPriceActive(true);
                        const defaultVal = currency === 'INR' ? '10' : (10 / 83.0 * convertPrice(1, currency)).toFixed(2);
                        setCustomPriceInput(defaultVal);
                      }}
                      className={`py-1.5 px-2 rounded-md text-[11px] font-semibold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                        isCustomPriceActive && (customPriceInput === '10' || customPriceInput === (10 / 83.0 * convertPrice(1, currency)).toFixed(2))
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                          : 'text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>₹10 (Rupees 10)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCustomPriceActive(true)}
                      className={`py-1.5 px-2 rounded-md text-[11px] font-semibold transition-all cursor-pointer text-center ${
                        isCustomPriceActive && customPriceInput !== '10' && customPriceInput !== (10 / 83.0 * convertPrice(1, currency)).toFixed(2)
                          ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {/* Editable Price Input Box */}
                  {isCustomPriceActive && (
                    <div className="space-y-1.5 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Type custom price ({currency}):</span>
                        <button
                          type="button"
                          onClick={() => {
                            const defaultVal = currency === 'INR' ? '10' : (10 / 83.0 * convertPrice(1, currency)).toFixed(2);
                            setCustomPriceInput(defaultVal);
                          }}
                          className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <RotateCcw className="w-2.5 h-2.5" /> Reset to ₹10
                        </button>
                      </div>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-sky-400 font-bold">
                          {currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'JPY' ? '¥' : '$'}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.1"
                          value={customPriceInput}
                          onChange={(e) => setCustomPriceInput(e.target.value)}
                          placeholder="10"
                          className="w-full bg-slate-900 border border-sky-500/50 rounded-lg pl-8 pr-16 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 uppercase">
                          {currency}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>
                          {isValidCustomPrice
                            ? `Custom Offer Price: ${formatCurrency(effectivePriceUsd, currency)} applied!`
                            : 'Enter a valid price higher than 0'}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-slate-400">Total Price ({currency}):</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white font-mono">
                      {formatCurrency(effectivePriceUsd, currency)}
                    </span>
                    {isCustomPriceActive && effectivePriceUsd !== currentLicenseObj.price && (
                      <span className="block text-[10px] text-emerald-400 font-bold font-mono">
                        Original: {formatCurrency(currentLicenseObj.price, currency)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onToggleCompare && (
                    <button
                      onClick={() => onToggleCompare(product)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isComparing
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-md shadow-sky-500/10'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                      }`}
                      title={isComparing ? 'Remove from Compare' : 'Add to Compare (Side-by-Side)'}
                    >
                      <ArrowRightLeft className={`w-4 h-4 ${isComparing ? 'text-sky-400' : ''}`} />
                    </button>
                  )}

                  {onToggleWishlist && (
                    <button
                      onClick={() => onToggleWishlist(product)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isWishlisted
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                      }`}
                      title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-400' : ''}`} />
                    </button>
                  )}

                  {onSavePriceAlert && (
                    <button
                      onClick={() => setIsPriceAlertBoxOpen(!isPriceAlertBoxOpen)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        existingAlert
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md shadow-amber-500/10'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                      }`}
                      title={existingAlert ? 'Edit Price Alert' : 'Set Price Drop Alert'}
                    >
                      <Bell className={`w-4 h-4 ${existingAlert ? 'fill-amber-400 text-amber-300' : ''}`} />
                    </button>
                  )}

                  <button
                    onClick={() => setIsShareBoxOpen(!isShareBoxOpen)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isShareBoxOpen
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-md shadow-sky-500/10'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                    title="Share Product Link"
                  >
                    <Share2 className={`w-4 h-4 ${isShareBoxOpen ? 'text-sky-400' : ''}`} />
                  </button>

                  <button
                    onClick={() => onAddToCart(product, selectedLicense, isCustomPriceActive ? effectivePriceUsd : undefined)}
                    className="flex-1 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => onDirectCheckout(product, selectedLicense, isCustomPriceActive ? effectivePriceUsd : undefined)}
                    className="flex-1 py-3 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-sky-500/20 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Buy Now</span>
                  </button>
                </div>

                {/* Share Product Box */}
                {isShareBoxOpen && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-sky-500/40 space-y-3.5 animate-in fade-in slide-in-from-top-2 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 text-xs text-sky-400 font-extrabold uppercase tracking-wider">
                        <Share2 className="w-4 h-4" />
                        <span>Share Digital Asset</span>
                      </div>
                      <button
                        onClick={() => setIsShareBoxOpen(false)}
                        className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Direct Link & Copy */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-400 block">
                        Direct Share Link (Product ID: <span className="font-mono text-sky-300">{product.id}</span>)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={getShareUrl()}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-sky-500 select-all"
                        />
                        <button
                          onClick={handleCopyShareLink}
                          className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                            isCopied
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                              : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
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

                    {/* Social Media & Messaging Buttons */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-400 block">Share via Social Media & Email:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out "${product.title}" on Open Ocean Market!`)}&url=${encodeURIComponent(getShareUrl())}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-sky-400 transition-colors font-medium text-[11px]"
                        >
                          <ExternalLink className="w-3 h-3 text-sky-400" />
                          <span>X / Twitter</span>
                        </a>

                        <a
                          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-sky-400 transition-colors font-medium text-[11px]"
                        >
                          <ExternalLink className="w-3 h-3 text-sky-400" />
                          <span>LinkedIn</span>
                        </a>

                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-sky-400 transition-colors font-medium text-[11px]"
                        >
                          <ExternalLink className="w-3 h-3 text-sky-400" />
                          <span>Facebook</span>
                        </a>

                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out "${product.title}" on Open Ocean: ${getShareUrl()}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-emerald-400 transition-colors font-medium text-[11px]"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-400" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={`mailto:?subject=${encodeURIComponent(`Check out "${product.title}"`)}&body=${encodeURIComponent(`Hey!\n\nCheck out this digital asset on Open Ocean Market:\n\n${product.title} by ${product.creatorName}\n\nLink: ${getShareUrl()}`)}`}
                          className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-amber-400 transition-colors font-medium text-[11px]"
                        >
                          <Mail className="w-3 h-3 text-amber-400" />
                          <span>Email Link</span>
                        </a>

                        {typeof navigator !== 'undefined' && 'share' in navigator && (
                          <button
                            onClick={handleNativeShare}
                            className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>More Apps</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {isCopied && (
                      <div className="p-2 bg-emerald-950/60 border border-emerald-500/30 rounded-lg text-emerald-300 text-[11px] text-center font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                        <span>Link containing Product ID "{product.id}" copied to clipboard!</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Price Alert Configuration Box */}
                {(isPriceAlertBoxOpen || existingAlert) && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 space-y-2 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                        <Bell className="w-3.5 h-3.5 fill-current" />
                        <span>Price Drop Alert</span>
                      </div>
                      {existingAlert && (
                        <button
                          onClick={() => {
                            if (onDeletePriceAlert) onDeletePriceAlert(product.id);
                            setIsPriceAlertBoxOpen(false);
                          }}
                          className="text-[11px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Remove Alert
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                          {currency}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={targetPriceInput}
                          onChange={(e) => setTargetPriceInput(e.target.value)}
                          placeholder="Target Price"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <button
                        onClick={() => {
                          const parsed = parseFloat(targetPriceInput);
                          if (!isNaN(parsed) && parsed > 0 && onSavePriceAlert) {
                            const usdVal = convertPrice(parsed, 'USD', currency);
                            onSavePriceAlert(product, usdVal);
                            setAlertSuccessNotice('Alert set!');
                            setTimeout(() => setAlertSuccessNotice(null), 2500);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{existingAlert ? 'Update' : 'Set Alert'}</span>
                      </button>
                    </div>

                    {alertSuccessNotice ? (
                      <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> {alertSuccessNotice}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400">
                        We will notify you when the price drops to or below {formatCurrency(parseFloat(targetPriceInput) || 0, currency)}.
                      </p>
                    )}
                  </div>
                )}

                <p className="text-[10px] text-center text-slate-500">
                  Instant secure delivery • License Key & VAT Invoice Included
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
