import React, { useState, useEffect } from 'react';
import {
  DigitalProduct,
  CategoryId,
  Currency,
  CartItem,
  Order,
  LicenseType,
  PriceAlert,
  ActivityLogItem,
  Review,
  ProductBundle,
} from './types/marketplace';
import { ALL_CATEGORIES } from './data/categories';
import { INITIAL_PRODUCTS } from './data/mockProducts';
import { INITIAL_REVIEWS } from './data/mockReviews';
import { INITIAL_BUNDLES } from './data/mockBundles';
import { formatCurrency } from './utils/currency';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { TrendingTagsCloud } from './components/TrendingTagsCloud';
import { FeaturedCollectionsCarousel } from './components/FeaturedCollectionsCarousel';
import { FeaturedCollection } from './data/mockCollections';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { MyLibrary } from './components/MyLibrary';
import { CreatorStudio } from './components/CreatorStudio';
import { AIAssistantModal } from './components/AIAssistantModal';
import { MarketplaceGovernance } from './components/MarketplaceGovernance';
import { MyWishlist } from './components/MyWishlist';
import { PriceAlertsModal } from './components/PriceAlertsModal';
import { PaymentHistoryModal } from './components/PaymentHistoryModal';
import { ProductComparisonModal } from './components/ProductComparisonModal';
import { ProductCompareFloatingBar } from './components/ProductCompareFloatingBar';
import { CartToast, CartToastData } from './components/CartToast';
import { RecentlyViewedSection } from './components/RecentlyViewedSection';
import { UploadDataModal } from './components/UploadDataModal';
import { CartDrawer } from './components/CartDrawer';
import {
  Compass,
  Sparkles,
  ShoppingBag,
  Filter,
  Star,
  ShieldCheck,
  Globe,
  Sliders,
  CheckCircle2,
  X,
  Trash2,
  ArrowRight,
  Zap,
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<DigitalProduct[]>(() => {
    const saved = localStorage.getItem('open_ocean_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('open_ocean_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('open_ocean_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('open_ocean_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem('open_ocean_price_alerts');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'alert-1',
        productId: '2',
        targetPrice: 35,
        currency: 'USD',
        createdAt: new Date().toISOString(),
        active: true,
      },
    ];
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(undefined);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [activeView, setActiveView] = useState<'marketplace' | 'creator' | 'library' | 'governance' | 'wishlist'>('marketplace');

  // Filter States
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price_low' | 'price_high' | 'rating'>('popular');
  const [minRating, setMinRating] = useState<number>(0);

  // User-controlled Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('open_ocean_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'dark';
  });

  useEffect(() => {
    try {
      localStorage.setItem('open_ocean_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<DigitalProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartToast, setCartToast] = useState<CartToastData | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isPriceAlertsModalOpen, setIsPriceAlertsModalOpen] = useState(false);
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);
  const [isUploadDataOpen, setIsUploadDataOpen] = useState(false);

  // Product Comparison State
  const [comparedProductIds, setComparedProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('open_ocean_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Recently Viewed State
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('open_ocean_recently_viewed');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['1', '3'];
  });

  const handleClearRecentlyViewed = () => {
    setRecentlyViewedIds([]);
    try {
      localStorage.removeItem('open_ocean_recently_viewed');
    } catch (e) {
      console.error(e);
    }
  };

  // Activity Log State
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('open_ocean_activity_log');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'act-1',
        type: 'purchase',
        title: 'Completed Digital Purchase',
        description: 'Successfully placed Order #ORD-88219 for 2 items',
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        amountUsd: 49.00,
      },
      {
        id: 'act-2',
        type: 'wishlist',
        title: 'Added to Wishlist',
        description: 'Saved "Cyberpunk 3D Modular City Pack" to curated wishlist',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        productId: '2',
        productPreviewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'act-3',
        type: 'view',
        title: 'Viewed Product Details',
        description: 'Explored specifications & licenses for "Full-Stack SaaS Starter Template"',
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        productId: '1',
        productPreviewUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
      },
    ];
  });

  const logActivity = (item: Omit<ActivityLogItem, 'id' | 'timestamp'>) => {
    const newEntry: ActivityLogItem = {
      ...item,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newEntry, ...prev].slice(0, 50));
  };

  const handleClearActivityLogs = () => {
    setActivityLogs([]);
    localStorage.removeItem('open_ocean_activity_log');
  };

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('open_ocean_reviews');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_REVIEWS;
  });

  const handleAddReview = (newRevData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...newRevData,
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString().split('T')[0],
    };

    setReviews((prev) => [newReview, ...prev]);

    // Update product rating and review count in product state
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        if (p.id === newRevData.productId) {
          const productRevs = [...reviews.filter((r) => r.productId === p.id), newReview];
          const avg = productRevs.reduce((a, b) => a + b.rating, 0) / productRevs.length;
          return {
            ...p,
            rating: parseFloat(avg.toFixed(1)),
            reviewCount: productRevs.length,
          };
        }
        return p;
      });
    });

    logActivity({
      type: 'view',
      title: `Published ${newRevData.rating}★ Review`,
      description: `Wrote feedback for "${products.find((p) => p.id === newRevData.productId)?.title || 'Digital Asset'}": "${newRevData.comment.substring(0, 45)}..."`,
      productId: newRevData.productId,
    });
  };

  // Bundles State
  const [bundles, setBundles] = useState<ProductBundle[]>(() => {
    try {
      const saved = localStorage.getItem('open_ocean_bundles');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BUNDLES;
  });

  const handleAddBundleToCart = (bundleItems: DigitalProduct[], discountPercentage: number) => {
    bundleItems.forEach((item) => {
      const regPrice = item.salePrice || item.price;
      const discountedPriceUsd = regPrice * (1 - discountPercentage / 100);
      handleAddToCart(item, 'personal', discountedPriceUsd);
    });
    logActivity({
      type: 'cart',
      title: `Added Product Bundle (${discountPercentage}% Off)`,
      description: `Added ${bundleItems.length} bundled digital assets to cart with discounted rate.`,
    });
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('open_ocean_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('open_ocean_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('open_ocean_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('open_ocean_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('open_ocean_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    localStorage.setItem('open_ocean_price_alerts', JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  useEffect(() => {
    localStorage.setItem('open_ocean_compare', JSON.stringify(comparedProductIds));
  }, [comparedProductIds]);

  useEffect(() => {
    localStorage.setItem('open_ocean_activity_log', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('open_ocean_bundles', JSON.stringify(bundles));
  }, [bundles]);


  // Handle shared wishlist or shared product URL parameters on mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedWishlistParam = urlParams.get('wishlist');
      if (sharedWishlistParam) {
        const sharedIds = sharedWishlistParam
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean);

        if (sharedIds.length > 0) {
          setWishlistIds((prev) => Array.from(new Set([...prev, ...sharedIds])));
          setActiveView('wishlist');
        }
      }

      // Check for shared product ID in URL
      const sharedProductId = urlParams.get('product') || urlParams.get('productId');
      if (sharedProductId) {
        const targetProduct = products.find((p) => p.id === sharedProductId);
        if (targetProduct) {
          setSelectedProduct(targetProduct);
        }
      }
    } catch (e) {
      console.error('Failed to parse shared URL parameters', e);
    }
  }, []);

  // Sync selectedProduct to URL parameter for easy copy-pasting & track in Recently Viewed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      if (selectedProduct) {
        url.searchParams.set('product', selectedProduct.id);

        // Prepend to recently viewed list (max 5)
        setRecentlyViewedIds((prev) => {
          const filtered = prev.filter((id) => id !== selectedProduct.id);
          const updated = [selectedProduct.id, ...filtered].slice(0, 5);
          try {
            localStorage.setItem('open_ocean_recently_viewed', JSON.stringify(updated));
          } catch (e) {
            console.error('Failed to save recently viewed to local storage', e);
          }
          return updated;
        });
      } else {
        url.searchParams.delete('product');
        url.searchParams.delete('productId');
      }
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      console.error('Failed to update URL search parameter:', e);
    }
  }, [selectedProduct]);

  const recentlyViewedProducts = recentlyViewedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is DigitalProduct => Boolean(p));

  const comparedProducts = products.filter((p) => comparedProductIds.includes(p.id));

  const handleToggleCompare = (product: DigitalProduct) => {
    setComparedProductIds((prev) => {
      if (prev.includes(product.id)) {
        return prev.filter((id) => id !== product.id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 products at a time.');
        return prev;
      }
      return [...prev, product.id];
    });
  };

  const handleRemoveFromCompare = (productId: string) => {
    setComparedProductIds((prev) => prev.filter((id) => id !== productId));
  };

  const handleClearCompare = () => {
    setComparedProductIds([]);
  };

  // Price Alert Handlers
  const handleSavePriceAlert = (product: DigitalProduct, targetPriceUsd: number) => {
    setPriceAlerts((prev) => {
      const existing = prev.find((a) => a.productId === product.id);
      if (existing) {
        return prev.map((a) =>
          a.productId === product.id
            ? { ...a, targetPrice: targetPriceUsd, createdAt: new Date().toISOString() }
            : a
        );
      } else {
        return [
          ...prev,
          {
            id: `alert-${Date.now()}`,
            productId: product.id,
            targetPrice: targetPriceUsd,
            currency: 'USD',
            createdAt: new Date().toISOString(),
            active: true,
          },
        ];
      }
    });
  };

  const handleDeletePriceAlert = (productId: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.productId !== productId));
  };

  const handleUpdatePriceAlert = (productId: string, newTargetPriceUsd: number) => {
    setPriceAlerts((prev) =>
      prev.map((a) =>
        a.productId === productId ? { ...a, targetPrice: newTargetPriceUsd } : a
      )
    );
  };

  const handleClearAllAlerts = () => {
    setPriceAlerts([]);
  };

  // Count triggered alerts
  const triggeredAlertsCount = priceAlerts.filter((alert) => {
    const product = products.find((p) => p.id === alert.productId);
    if (!product) return false;
    const currentPriceUsd = product.salePrice || product.price;
    return currentPriceUsd <= alert.targetPrice;
  }).length;

  // Read shared wishlist parameter on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wishlistParam = params.get('wishlist');
    if (wishlistParam) {
      const ids = wishlistParam.split(',').map((id) => id.trim()).filter(Boolean);
      if (ids.length > 0) {
        setWishlistIds((prev) => Array.from(new Set([...prev, ...ids])));
        setActiveView('wishlist');
      }
    }
  }, []);

  // Product Selection with Activity Logging
  const handleSelectProduct = (product: DigitalProduct | null) => {
    setSelectedProduct(product);
    if (product) {
      logActivity({
        type: 'view',
        title: `Viewed "${product.title}"`,
        description: `Explored specifications and licenses for ${product.categoryName}`,
        productId: product.id,
        productPreviewUrl: product.previewUrl,
      });
    }
  };

  // Wishlist Handlers
  const handleToggleWishlist = (product: DigitalProduct) => {
    const isAdding = !wishlistIds.includes(product.id);
    setWishlistIds((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id]
    );

    logActivity({
      type: 'wishlist',
      title: isAdding ? `Added to Wishlist` : `Removed from Wishlist`,
      description: `${isAdding ? 'Saved' : 'Removed'} "${product.title}" ${isAdding ? 'in' : 'from'} curated wishlist`,
      productId: product.id,
      productPreviewUrl: product.previewUrl,
    });
  };

  const handleClearWishlist = () => {
    setWishlistIds([]);
  };

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  // Category Selection Handler
  const handleSelectCategory = (catId: CategoryId | 'all', subcat?: string) => {
    setSelectedCategory(catId);
    setSelectedSubcategory(subcat);
    setActiveCollectionId(null);
  };

  // Collection Selection Handler
  const handleSelectCollection = (col: FeaturedCollection | null) => {
    if (!col) {
      setActiveCollectionId(null);
      setSelectedTag(null);
      return;
    }
    setActiveCollectionId(col.id);
    if (col.targetTag) {
      setSelectedTag(col.targetTag);
    }
    if (col.targetCategory) {
      setSelectedCategory(col.targetCategory as CategoryId);
      setSelectedSubcategory(undefined);
    }
  };

  // Add to Cart
  const handleAddToCart = (
    product: DigitalProduct,
    license: LicenseType = 'personal',
    customPriceUsd?: number
  ) => {
    const licObj = product.licenses.find((l) => l.type === license) || product.licenses[0];
    const finalPrice = customPriceUsd !== undefined ? customPriceUsd : licObj.price;

    logActivity({
      type: 'cart',
      title: `Added to Cart`,
      description: `Added "${product.title}" (${license} license) to cart`,
      productId: product.id,
      productPreviewUrl: product.previewUrl,
      amountUsd: finalPrice,
    });

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (ci) => ci.product.id === product.id && ci.selectedLicense === license
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += 1;
        if (customPriceUsd !== undefined) {
          updated[existingIndex].price = customPriceUsd;
        }
        return updated;
      } else {
        return [
          ...prevCart,
          {
            product,
            selectedLicense: license,
            price: finalPrice,
            quantity: 1,
          },
        ];
      }
    });

    // Trigger Toast Notification
    setCartToast({
      id: Date.now().toString(),
      product,
      quantity: 1,
      license,
      price: finalPrice,
    });
  };

  // Direct Instant Purchase
  const handleDirectCheckout = (
    product: DigitalProduct,
    license: LicenseType = 'personal',
    customPriceUsd?: number
  ) => {
    const licObj = product.licenses.find((l) => l.type === license) || product.licenses[0];
    const finalPrice = customPriceUsd !== undefined ? customPriceUsd : licObj.price;

    setCart([
      {
        product,
        selectedLicense: license,
        price: finalPrice,
        quantity: 1,
      },
    ]);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  // Remove item from cart
  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(index);
      return;
    }
    setCart((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: newQty } : item))
    );
  };

  // Filter & Search Logic
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
      return false;
    }
    if (selectedSubcategory && p.subcategory !== selectedSubcategory) {
      return false;
    }
    if (selectedTag) {
      const normTag = selectedTag.toLowerCase();
      if (!p.tags || !p.tags.some((t) => t.toLowerCase() === normTag)) {
        return false;
      }
    }
    if (minRating > 0 && p.rating < minRating) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCat = p.categoryName.toLowerCase().includes(q);
      const matchSub = p.subcategory.toLowerCase().includes(q);
      const matchTag = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchCat && !matchSub && !matchTag) {
        return false;
      }
    }
    return true;
  });

  // Sort Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'popular') return b.downloadCount - a.downloadCount;
    if (sortBy === 'newest') return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className={`min-h-screen font-sans flex flex-col selection:bg-sky-500 selection:text-slate-950 transition-colors duration-200 ${theme === 'light' ? 'light-theme bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      {/* Top Header */}
      <Header
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currency={currency}
        onCurrencyChange={setCurrency}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        wishlistCount={wishlistIds.length}
        compareCount={comparedProductIds.length}
        priceAlertsCount={priceAlerts.length}
        triggeredAlertsCount={triggeredAlertsCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenPriceAlerts={() => setIsPriceAlertsModalOpen(true)}
        onOpenPaymentHistory={() => setIsPaymentHistoryOpen(true)}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        activeView={activeView}
        onNavigate={setActiveView}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenUploadData={() => setIsUploadDataOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1">
        {activeView === 'marketplace' && (
          <div>
            {/* Category Navigation Pills */}
            <CategoryNav
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onSelectCategory={handleSelectCategory}
            />

            {/* Trending Tags Cloud */}
            <TrendingTagsCloud
              products={products}
              selectedTag={selectedTag}
              onSelectTag={(tag) => setSelectedTag(tag)}
            />

            {/* Hero Banner (Only shown on "All" view with no search) */}
            {selectedCategory === 'all' && !searchQuery && (
              <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/80 py-12 md:py-16">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider">
                        <Globe className="w-3.5 h-3.5" />
                        Global Marketplace for Digital Goods
                      </div>

                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                        Discover & Buy Premium <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">
                          Digital Assets Worldwide
                        </span>
                      </h1>

                      <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed mx-auto lg:mx-0">
                        Explore over 24 structured taxonomy categories: eBooks, online courses, music stems, 3D game models, Lightroom presets, Figma UI kits, Next.js starter templates, and AI prompts.
                      </p>

                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                        <button
                          onClick={() => setIsAiAssistantOpen(true)}
                          className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-purple-600/20 transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4 text-purple-200" />
                          <span>Try Gemini AI Asset Assistant</span>
                        </button>

                        <button
                          onClick={() => setActiveView('creator')}
                          className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-800 transition-colors cursor-pointer"
                        >
                          Start Selling on Open Ocean
                        </button>
                      </div>

                      {/* Marketplace Trust Stats */}
                      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-md mx-auto lg:mx-0 text-left">
                        <div>
                          <p className="text-lg font-black text-white font-mono">$12.4M+</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Paid to Creators</p>
                        </div>
                        <div>
                          <p className="text-lg font-black text-sky-400 font-mono">24</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Categories</p>
                        </div>
                        <div>
                          <p className="text-lg font-black text-emerald-400 font-mono">100%</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Verified License</p>
                        </div>
                      </div>
                    </div>

                    {/* Feature Showcase Grid */}
                    <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                      {ALL_CATEGORIES.slice(0, 4).map((cat) => (
                        <div
                          key={cat.id}
                          onClick={() => handleSelectCategory(cat.id)}
                          className="p-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-2xl transition-all cursor-pointer group shadow-lg"
                        >
                          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1">
                            {cat.productCount} Items
                          </span>
                          <h3 className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                            {cat.name}
                          </h3>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                            {cat.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Catalogue Workspace */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
              {/* Featured Collections Carousel */}
              <FeaturedCollectionsCarousel
                activeCollectionId={activeCollectionId}
                onSelectCollection={handleSelectCollection}
              />

              {/* Recently Viewed Assets */}
              <RecentlyViewedSection
                products={recentlyViewedProducts}
                currency={currency}
                onSelectProduct={handleSelectProduct}
                onAddToCart={(prod) => handleAddToCart(prod, 'personal')}
                onClearHistory={handleClearRecentlyViewed}
              />

              {/* Controls Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300">
                  <Filter className="w-4 h-4 text-sky-400" />
                  <span>
                    Showing {sortedProducts.length} Digital Asset{sortedProducts.length !== 1 ? 's' : ''}
                  </span>
                  {selectedCategory !== 'all' && (
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[11px] font-mono">
                      {ALL_CATEGORIES.find((c) => c.id === selectedCategory)?.name}
                    </span>
                  )}
                  {activeCollectionId && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-mono border border-amber-500/40">
                      Collection Active
                      <button
                        onClick={() => handleSelectCollection(null)}
                        className="hover:text-white cursor-pointer ml-1 text-slate-400 font-bold"
                        title="Clear collection filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedTag && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[11px] font-mono border border-sky-500/40">
                      #{selectedTag}
                      <button
                        onClick={() => setSelectedTag(null)}
                        className="hover:text-white cursor-pointer ml-1 text-slate-400 font-bold"
                        title="Remove tag filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {/* Rating filter */}
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value={0}>All Ratings</option>
                    <option value={4.5}>4.5★ & Above</option>
                    <option value={4.8}>4.8★ & Above</option>
                  </select>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer font-medium"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest Listed</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Products Catalogue Grid */}
              {sortedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      currency={currency}
                      isWishlisted={wishlistIds.includes(product.id)}
                      isComparing={comparedProductIds.includes(product.id)}
                      onSelectProduct={handleSelectProduct}
                      onAddToCart={(prod) => handleAddToCart(prod, 'personal')}
                      onToggleWishlist={handleToggleWishlist}
                      onToggleCompare={handleToggleCompare}
                      onSelectTag={(tag) => setSelectedTag(tag)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto">
                  <Compass className="w-12 h-12 text-slate-600 mx-auto animate-spin" />
                  <div>
                    <h3 className="text-lg font-bold text-white">No Matching Products Found</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Try clearing search filters or explore other categories from the 24 taxonomy list.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSubcategory(undefined);
                      setSelectedTag(null);
                      setSearchQuery('');
                      setMinRating(0);
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Reset Catalogue Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Creator Studio Dashboard */}
        {activeView === 'creator' && (
          <CreatorStudio
            products={products}
            currency={currency}
            onAddProduct={(newP) => setProducts((prev) => [newP, ...prev])}
            onDeleteProduct={(id) => setProducts((prev) => prev.filter((p) => p.id !== id))}
          />
        )}

        {/* My Purchased Vault & Profile Activity Log */}
        {activeView === 'library' && (
          <MyLibrary
            orders={orders}
            currency={currency}
            onExploreMore={() => setActiveView('marketplace')}
            activityLogs={activityLogs}
            onClearActivityLogs={handleClearActivityLogs}
            onSelectProduct={handleSelectProduct}
            allProducts={products}
          />
        )}

        {/* My Wishlist */}
        {activeView === 'wishlist' && (
          <MyWishlist
            wishlistProducts={wishlistProducts}
            currency={currency}
            comparedProductIds={comparedProductIds}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(prod) => handleAddToCart(prod, 'personal')}
            onToggleWishlist={handleToggleWishlist}
            onToggleCompare={handleToggleCompare}
            onClearWishlist={handleClearWishlist}
            onExploreMore={() => setActiveView('marketplace')}
          />
        )}

        {/* Marketplace Governance & Terms */}
        {activeView === 'governance' && <MarketplaceGovernance />}
      </main>

      {/* Modals & Slide-over Drawers */}

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          allProducts={products}
          currency={currency}
          isWishlisted={wishlistIds.includes(selectedProduct.id)}
          isComparing={comparedProductIds.includes(selectedProduct.id)}
          existingAlert={priceAlerts.find((a) => a.productId === selectedProduct.id)}
          reviews={reviews}
          bundles={bundles}
          hasPurchased={orders.some((o) =>
            o.items.some((i) => i.product.id === selectedProduct.id)
          )}
          onAddReview={handleAddReview}
          onAddBundleToCart={handleAddBundleToCart}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(prod, lic, customPriceUsd) => {
            handleAddToCart(prod, lic, customPriceUsd);
            setSelectedProduct(null);
          }}
          onDirectCheckout={handleDirectCheckout}
          onToggleWishlist={handleToggleWishlist}
          onToggleCompare={handleToggleCompare}
          onSavePriceAlert={handleSavePriceAlert}
          onDeletePriceAlert={handleDeletePriceAlert}
          onSelectProduct={(p) => handleSelectProduct(p)}
        />
      )}

      {/* Upload Data Modal */}
      <UploadDataModal
        isOpen={isUploadDataOpen}
        onClose={() => setIsUploadDataOpen(false)}
        onImportBulkProducts={(newProds) => {
          setProducts((prev) => [...newProds, ...prev]);
        }}
        onAddSingleProduct={(newProd) => {
          setProducts((prev) => [newProd, ...prev]);
        }}
      />

      {/* Price Drop Alerts Modal */}
      <PriceAlertsModal
        isOpen={isPriceAlertsModalOpen}
        onClose={() => setIsPriceAlertsModalOpen(false)}
        priceAlerts={priceAlerts}
        allProducts={products}
        currency={currency}
        onDeleteAlert={handleDeletePriceAlert}
        onUpdateAlert={handleUpdatePriceAlert}
        onClearAllAlerts={handleClearAllAlerts}
        onAddToCart={(p) => handleAddToCart(p, 'personal')}
        onSelectProduct={(p) => handleSelectProduct(p)}
      />

      {/* AI Assistant Modal */}
      {isAiAssistantOpen && (
        <AIAssistantModal
          onClose={() => setIsAiAssistantOpen(false)}
          onSelectCategory={(catId) => {
            handleSelectCategory(catId);
            setActiveView('marketplace');
          }}
        />
      )}

      {/* Product Comparison Modal */}
      <ProductComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        comparedProducts={comparedProducts}
        allProducts={products}
        onRemoveFromCompare={handleRemoveFromCompare}
        onAddToCompare={handleToggleCompare}
        onClearCompare={handleClearCompare}
        currency={currency}
        onAddToCart={(prod, lic) => handleAddToCart(prod, lic)}
        onSelectProduct={(p) => handleSelectProduct(p)}
      />

      {/* Floating Compare Action Bar */}
      <ProductCompareFloatingBar
        comparedProducts={comparedProducts}
        onOpenCompareModal={() => setIsCompareModalOpen(true)}
        onRemoveFromCompare={handleRemoveFromCompare}
        onClearCompare={handleClearCompare}
      />

      {/* Payment History Modal */}
      <PaymentHistoryModal
        isOpen={isPaymentHistoryOpen}
        onClose={() => setIsPaymentHistoryOpen(false)}
        orders={orders}
        currency={currency}
        onClearHistory={() => setOrders([])}
      />

      {/* Checkout Processing Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          cartItems={cart}
          currency={currency}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderCompleted={(newOrder) => {
            setOrders((prev) => [newOrder, ...prev]);
            setCart([]);
            logActivity({
              type: 'purchase',
              title: `Completed Digital Purchase`,
              description: `Successfully placed Order #${newOrder.id} containing ${newOrder.items.length} item(s)`,
              amountUsd: newOrder.total,
            });
          }}
        />
      )}

      {/* Add To Cart Toast Notification */}
      <CartToast
        toast={cartToast}
        currency={currency}
        onViewCart={() => setIsCartOpen(true)}
        onClose={() => setCartToast(null)}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        currency={currency}
        onCurrencyChange={(newCurr) => setCurrency(newCurr)}
        onRemoveFromCart={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Global Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-10 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-black text-base">
              <Compass className="w-5 h-5 text-sky-400" />
              <span>OPEN OCEAN</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Global marketplace for digital products. Buy and sell eBooks, online courses, music, 3D models, AI prompts, software, and templates with integrated multi-gateway payouts.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Taxonomy Categories
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li>Books & Publications</li>
              <li>Software & Development</li>
              <li>AI Products & Prompts</li>
              <li>3D Models & Game Assets</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Marketplace Legal
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li
                onClick={() => setActiveView('governance')}
                className="hover:text-white cursor-pointer"
              >
                License Terms Matrix
              </li>
              <li
                onClick={() => setActiveView('governance')}
                className="hover:text-white cursor-pointer"
              >
                Seller Commission & Payout Flow
              </li>
              <li
                onClick={() => setActiveView('governance')}
                className="hover:text-white cursor-pointer"
              >
                VAT & Global Tax Rules
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Payment Gateways
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
              Integrated with Stripe, Razorpay, PayPal, and Crypto Pay. Secret keys stored securely on server.
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-900 text-center text-[11px] text-slate-600">
          © {new Date().getFullYear()} Open Ocean Global Digital Marketplace. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
