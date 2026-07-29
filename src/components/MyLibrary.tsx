import React, { useState } from 'react';
import JSZip from 'jszip';
import { Order, Currency, DigitalProduct, ActivityLogItem, ActivityType } from '../types/marketplace';
import { formatCurrency } from '../utils/currency';
import {
  Download,
  FileCheck,
  FileText,
  Search,
  ShieldCheck,
  Check,
  Copy,
  Archive,
  CheckSquare,
  Square,
  Loader2,
  X,
  FileCode,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  FolderArchive,
  Activity,
  Clock,
  Eye,
  Heart,
  ShoppingCart,
  ShoppingBag,
  Bell,
  ArrowRightLeft,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface MyLibraryProps {
  orders: Order[];
  currency: Currency;
  onExploreMore: () => void;
  activityLogs?: ActivityLogItem[];
  onClearActivityLogs?: () => void;
  onSelectProduct?: (product: DigitalProduct) => void;
  allProducts?: DigitalProduct[];
}

function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Just now';
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Recently';
  }
}

export const MyLibrary: React.FC<MyLibraryProps> = ({
  orders,
  currency,
  onExploreMore,
  activityLogs = [],
  onClearActivityLogs,
  onSelectProduct,
  allProducts = [],
}) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'activity'>('vault');
  const [activityFilter, setActivityFilter] = useState<ActivityType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  
  // Bulk Download Modal State
  const [isBulkDownloadModalOpen, setIsBulkDownloadModalOpen] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipStatusText, setZipStatusText] = useState('');
  
  // ZIP Options
  const [includeCertificates, setIncludeCertificates] = useState(true);
  const [includeMetadataJson, setIncludeMetadataJson] = useState(true);
  const [includeReadme, setIncludeReadme] = useState(true);

  // Flatten items from all orders
  const allPurchased = orders.flatMap((ord) =>
    ord.items.map((it, itemIdx) => ({
      ...it,
      uniqueId: `${ord.id}-${it.product.id}-${itemIdx}`,
      orderId: ord.id,
      orderDate: ord.date,
      invoiceNumber: ord.invoiceNumber,
      licenseKey: ord.licenseKeys[it.product.id] || 'LIC-OPENOCEAN-KEY',
    }))
  );

  const filtered = allPurchased.filter(
    (item) =>
      item.product.title.toLowerCase().includes(search.toLowerCase()) ||
      item.product.categoryName.toLowerCase().includes(search.toLowerCase()) ||
      item.orderId.toLowerCase().includes(search.toLowerCase())
  );

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Selection state helpers
  const isAllFilteredSelected =
    filtered.length > 0 && filtered.every((it) => selectedItemIds.includes(it.uniqueId));

  const toggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filtered.map((it) => it.uniqueId));
    }
  };

  const toggleSelectItem = (uniqueId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(uniqueId) ? prev.filter((id) => id !== uniqueId) : [...prev, uniqueId]
    );
  };

  // Function to download a single item as a ZIP
  const handleDownloadSingleZip = async (item: typeof allPurchased[0]) => {
    try {
      const zip = new JSZip();
      const sanitizedTitle = item.product.title.replace(/[^a-zA-Z0-9]/g, '_');
      const folder = zip.folder(sanitizedTitle) || zip;

      folder.file(
        'README.txt',
        `=================================================\nOPEN OCEAN DIGITAL ASSET - READ ME\n=================================================\nProduct: ${item.product.title}\nCategory: ${item.product.categoryName}\nSubcategory: ${item.product.subcategory}\nFile Format: ${item.product.fileFormat}\nFile Size: ${item.product.fileSize}\nLicense Tier: ${item.selectedLicense.toUpperCase()}\nSerial License Key: ${item.licenseKey}\nOrder ID: ${item.orderId}\nInvoice Number: ${item.invoiceNumber}\nDate Purchased: ${item.orderDate}\nCreator: ${item.product.creatorName}\n\nFeatures:\n${item.product.features.map((f) => '  - ' + f).join('\n')}\n\nThank you for purchasing on Open Ocean Marketplace!`
      );

      folder.file(
        'License_Certificate.txt',
        `=================================================\nOFFICIAL OPEN OCEAN LICENSE CERTIFICATE\n=================================================\nProduct Title: ${item.product.title}\nLicense Granted: ${item.selectedLicense.toUpperCase()} LICENSE\nLicense Serial Key: ${item.licenseKey}\nOrder Number: ${item.orderId}\nInvoice Reference: ${item.invoiceNumber}\nIssue Date: ${item.orderDate}\nStatus: VERIFIED & ACTIVE\n\nTerms of Use:\nThis certificate grants lifetime usage rights according to the ${item.selectedLicense} license terms specified at Open Ocean Registry.\n=================================================`
      );

      folder.file(
        'Asset_Metadata.json',
        JSON.stringify(
          {
            product: item.product,
            license: item.selectedLicense,
            licenseKey: item.licenseKey,
            orderId: item.orderId,
            orderDate: item.orderDate,
            invoiceNumber: item.invoiceNumber,
          },
          null,
          2
        )
      );

      // Attempt image preview fetch if available
      try {
        const resp = await fetch(item.product.previewUrl);
        if (resp.ok) {
          const blob = await resp.blob();
          folder.file(`Preview_Cover.jpg`, blob);
        }
      } catch {
        // Fallback if CORS prevents fetching external image blob
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OpenOcean_${sanitizedTitle}_Bundle.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error creating single ZIP:', err);
      alert(`Failed to create ZIP package for ${item.product.title}.`);
    }
  };

  // Function to execute Bulk Download of selected or all items
  const executeBulkZipDownload = async () => {
    const itemsToExport =
      selectedItemIds.length > 0
        ? allPurchased.filter((it) => selectedItemIds.includes(it.uniqueId))
        : filtered;

    if (itemsToExport.length === 0) {
      alert('No assets available to package into ZIP.');
      return;
    }

    setIsGeneratingZip(true);
    setZipProgress(10);
    setZipStatusText('Initializing Open Ocean Archive Generator...');

    try {
      const zip = new JSZip();
      const exportDate = new Date().toISOString().slice(0, 10);
      const masterFolder = zip.folder(`OpenOcean_Asset_Vault_${exportDate}`) || zip;

      // Master Readme / Index
      if (includeReadme) {
        masterFolder.file(
          '00_VAULT_INDEX_SUMMARY.txt',
          `=================================================\nOPEN OCEAN BULK DIGITAL ASSET VAULT ARCHIVE\n=================================================\nGenerated Date: ${new Date().toLocaleString()}\nTotal Assets Packaged: ${itemsToExport.length}\nUser Email / Account: Verified License Holder\n\nCONTAINED ASSETS:\n` +
            itemsToExport
              .map(
                (item, i) =>
                  ` [${i + 1}] ${item.product.title}\n     Category: ${item.product.categoryName} (${item.product.fileFormat})\n     License: ${item.selectedLicense.toUpperCase()} | Key: ${item.licenseKey}\n     Order #: ${item.orderId} (${item.orderDate})\n`
              )
              .join('\n') +
            `\n=================================================\nSupport & License Verification: https://openocean.market/support`
        );
      }

      if (includeMetadataJson) {
        masterFolder.file(
          '00_VAULT_MANIFEST.json',
          JSON.stringify(
            {
              exportDate: new Date().toISOString(),
              totalAssets: itemsToExport.length,
              assets: itemsToExport.map((it) => ({
                id: it.product.id,
                title: it.product.title,
                category: it.product.categoryName,
                fileFormat: it.product.fileFormat,
                fileSize: it.product.fileSize,
                license: it.selectedLicense,
                licenseKey: it.licenseKey,
                orderId: it.orderId,
                orderDate: it.orderDate,
                invoiceNumber: it.invoiceNumber,
              })),
            },
            null,
            2
          )
        );
      }

      // Loop through products and create individual folders
      const totalCount = itemsToExport.length;
      for (let i = 0; i < totalCount; i++) {
        const item = itemsToExport[i];
        const progressPct = 10 + Math.floor(((i + 1) / totalCount) * 75);
        setZipProgress(progressPct);
        setZipStatusText(`Packaging (${i + 1}/${totalCount}): ${item.product.title}...`);

        const folderName = `${String(i + 1).padStart(2, '0')}_${item.product.title.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const itemFolder = masterFolder.folder(folderName);

        if (itemFolder) {
          if (includeReadme) {
            itemFolder.file(
              'README.txt',
              `=================================================\nASSET DETAILS\n=================================================\nTitle: ${item.product.title}\nCategory: ${item.product.categoryName}\nFile Format: ${item.product.fileFormat}\nSize: ${item.product.fileSize}\nLicense: ${item.selectedLicense}\nSerial Key: ${item.licenseKey}\nOrder ID: ${item.orderId}\nInvoice: ${item.invoiceNumber}\n\nFeatures:\n${item.product.features.map((f) => '- ' + f).join('\n')}`
            );
          }

          if (includeCertificates) {
            itemFolder.file(
              'License_Certificate.txt',
              `=================================================\nOPEN OCEAN OFFICIAL LICENSE CERTIFICATE\n=================================================\nProduct: ${item.product.title}\nLicense Tier: ${item.selectedLicense.toUpperCase()}\nKey: ${item.licenseKey}\nOrder: ${item.orderId}\nInvoice: ${item.invoiceNumber}\nIssue Date: ${item.orderDate}\nStatus: VERIFIED & ACTIVE\n=================================================`
            );
          }

          if (includeMetadataJson) {
            itemFolder.file(
              'Metadata.json',
              JSON.stringify(
                {
                  productId: item.product.id,
                  title: item.product.title,
                  category: item.product.categoryName,
                  license: item.selectedLicense,
                  licenseKey: item.licenseKey,
                  orderId: item.orderId,
                  orderDate: item.orderDate,
                },
                null,
                2
              )
            );
          }

          // Try fetching image preview
          try {
            const resp = await fetch(item.product.previewUrl);
            if (resp.ok) {
              const imgBlob = await resp.blob();
              itemFolder.file(`Preview_Cover.jpg`, imgBlob);
            }
          } catch {
            // Ignore preview image fetch errors
          }
        }
      }

      setZipProgress(90);
      setZipStatusText('Compressing files into final .ZIP archive...');

      const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        const genPct = 90 + Math.floor((metadata.percent / 100) * 10);
        setZipProgress(Math.min(genPct, 99));
      });

      setZipProgress(100);
      setZipStatusText('Archive ready! Starting browser download...');

      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OpenOcean_Library_Bulk_Archive_${exportDate}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setIsGeneratingZip(false);
        setIsBulkDownloadModalOpen(false);
      }, 1000);
    } catch (err) {
      console.error('Bulk ZIP creation error:', err);
      alert('Failed to generate bulk ZIP archive.');
      setIsGeneratingZip(false);
    }
  };

  const selectedCount = selectedItemIds.length;
  const targetCountToDownload = selectedCount > 0 ? selectedCount : filtered.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-sky-950 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30">
              User Profile & Rights Registry
            </span>
            <span className="text-xs text-slate-400">• Open Ocean Account</span>
          </div>
          <h1 className="text-2xl font-black text-white">My Account & Purchased Vault</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your digital purchases, licenses, re-downloads, and audit recent interactions in your Activity Log.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900/80 backdrop-blur px-4 py-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block">Total Assets</span>
            <span className="text-lg font-black font-mono text-white">{allPurchased.length}</span>
          </div>
          <div className="bg-slate-900/80 backdrop-blur px-4 py-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block">Logged Events</span>
            <span className="text-lg font-black font-mono text-emerald-400">{activityLogs.length}</span>
          </div>
        </div>
      </div>

      {/* Main Profile Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('vault')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
            activeTab === 'vault'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <FolderArchive className="w-4 h-4" />
          <span>Purchased Vault ({allPurchased.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
            activeTab === 'activity'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Activity Log ({activityLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: VAULT ASSETS */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          {/* Filter & Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search assets, categories, order IDs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Select All Toggle Button */}
              {filtered.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isAllFilteredSelected ? (
                    <CheckSquare className="w-4 h-4 text-sky-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                  <span>{isAllFilteredSelected ? 'Deselect All' : 'Select All'}</span>
                  {selectedCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {selectedCount}
                    </span>
                  )}
                </button>
              )}

              {/* Bulk Download ZIP Button */}
              {filtered.length > 0 && (
                <button
                  onClick={() => setIsBulkDownloadModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-sky-500/20"
                >
                  <Archive className="w-4 h-4" />
                  <span>
                    {selectedCount > 0
                      ? `Bulk Download Selected (${selectedCount} ZIP)`
                      : `Bulk Download All (${filtered.length} ZIP)`}
                  </span>
                </button>
              )}

              <button
                onClick={onExploreMore}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Browse Marketplace
              </button>
            </div>
          </div>

          {/* Asset Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => {
                const isSelected = selectedItemIds.includes(item.uniqueId);

                return (
                  <div
                    key={item.uniqueId}
                    className={`bg-slate-900 border rounded-2xl overflow-hidden p-4 flex flex-col justify-between space-y-4 shadow-xl transition-all ${
                      isSelected ? 'border-sky-500 ring-1 ring-sky-500/50 bg-sky-950/20' : 'border-slate-800'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="relative w-full h-40 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 group">
                        <img
                          src={item.product.previewUrl}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />

                        {/* Checkbox select badge */}
                        <button
                          onClick={() => toggleSelectItem(item.uniqueId)}
                          className={`absolute top-2 right-2 p-1.5 rounded-lg border backdrop-blur transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-sky-500 text-slate-950 border-sky-400'
                              : 'bg-slate-950/80 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                          title={isSelected ? 'Deselect Item' : 'Select Item for Bulk Export'}
                        >
                          {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <Square className="w-4 h-4" />}
                        </button>

                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950/80 text-sky-400 border border-sky-500/30">
                          {item.product.categoryName}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                          <span>Order #{item.orderId}</span>
                          <span>{item.orderDate}</span>
                        </div>
                        <h3 className="font-bold text-sm text-white line-clamp-2">{item.product.title}</h3>
                        <p className="text-xs text-sky-400 font-semibold uppercase tracking-wider mt-1">
                          License: {item.selectedLicense}
                        </p>
                      </div>

                      {/* License Key box */}
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Serial Key:</span>
                          <span className="text-sky-300 font-bold tracking-wider">{item.licenseKey}</span>
                        </div>
                        <button
                          onClick={() => copyKey(item.licenseKey)}
                          className="p-1 text-slate-400 hover:text-white cursor-pointer"
                        >
                          {copiedKey === item.licenseKey ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => handleDownloadSingleZip(item)}
                        className="py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/10"
                        title="Download asset package as a ZIP archive"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download ZIP</span>
                      </button>

                      <button
                        onClick={() =>
                          alert(
                            `Generating Open Ocean Official License Certificate (.PDF)\nLicense Key: ${item.licenseKey}\nTier: ${item.selectedLicense}`
                          )
                        }
                        className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer border border-slate-700 flex items-center justify-center gap-1.5"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-sky-400" />
                        <span>Certificate</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto">
              <FileText className="w-12 h-12 text-slate-600 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-white">No Assets Found in Your Vault</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Explore Open Ocean's 24 categories of eBooks, 3D models, AI prompts, software kits, and music sample packs!
                </p>
              </div>
              <button
                onClick={onExploreMore}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Explore Marketplace Catalogue
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVITY LOG SECTION */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>Total Actions</span>
              </span>
              <span className="text-xl font-black font-mono text-white block">
                {activityLogs.length}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>Products Viewed</span>
              </span>
              <span className="text-xl font-black font-mono text-sky-400 block">
                {activityLogs.filter((a) => a.type === 'view').length}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Wishlist Saves</span>
              </span>
              <span className="text-xl font-black font-mono text-rose-400 block">
                {activityLogs.filter((a) => a.type === 'wishlist').length}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Purchases Made</span>
              </span>
              <span className="text-xl font-black font-mono text-emerald-400 block">
                {activityLogs.filter((a) => a.type === 'purchase').length}
              </span>
            </div>
          </div>

          {/* Activity Filters Toolbar */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter activity history..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {onClearActivityLogs && activityLogs.length > 0 && (
                <button
                  onClick={onClearActivityLogs}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Activity History</span>
                </button>
              )}
            </div>

            {/* Category Filter Badges */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
              <button
                onClick={() => setActivityFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activityFilter === 'all'
                    ? 'bg-slate-200 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Events ({activityLogs.length})
              </button>

              <button
                onClick={() => setActivityFilter('view')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  activityFilter === 'view'
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-sky-300 border border-slate-800'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Product Views</span>
              </button>

              <button
                onClick={() => setActivityFilter('wishlist')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  activityFilter === 'wishlist'
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-rose-300 border border-slate-800'
                }`}
              >
                <Heart className="w-3 h-3" />
                <span>Wishlist</span>
              </button>

              <button
                onClick={() => setActivityFilter('cart')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  activityFilter === 'cart'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-amber-300 border border-slate-800'
                }`}
              >
                <ShoppingCart className="w-3 h-3" />
                <span>Cart Updates</span>
              </button>

              <button
                onClick={() => setActivityFilter('purchase')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  activityFilter === 'purchase'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-emerald-300 border border-slate-800'
                }`}
              >
                <ShoppingBag className="w-3 h-3" />
                <span>Purchases</span>
              </button>
            </div>
          </div>

          {/* Activity Timeline list */}
          {(() => {
            const filteredLogs = activityLogs.filter((log) => {
              if (activityFilter !== 'all' && log.type !== activityFilter) return false;
              if (search.trim()) {
                const q = search.toLowerCase();
                return (
                  log.title.toLowerCase().includes(q) ||
                  log.description.toLowerCase().includes(q) ||
                  log.type.toLowerCase().includes(q)
                );
              }
              return true;
            });

            if (filteredLogs.length === 0) {
              return (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3 max-w-md mx-auto">
                  <Activity className="w-10 h-10 text-slate-600 mx-auto" />
                  <h3 className="font-bold text-white text-base">No Matching Interactions Logged</h3>
                  <p className="text-xs text-slate-400">
                    Interact with products, add items to wishlist, or complete purchases to track actions in your profile log.
                  </p>
                </div>
              );
            }

            return (
              <div className="relative pl-6 border-l-2 border-slate-800 space-y-4 my-2">
                {filteredLogs.map((log) => {
                  let IconComponent = Clock;
                  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

                  if (log.type === 'view') {
                    IconComponent = Eye;
                    colorClasses = 'bg-sky-500/20 text-sky-400 border-sky-500/30';
                  } else if (log.type === 'wishlist') {
                    IconComponent = Heart;
                    colorClasses = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
                  } else if (log.type === 'cart') {
                    IconComponent = ShoppingCart;
                    colorClasses = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                  } else if (log.type === 'purchase') {
                    IconComponent = ShoppingBag;
                    colorClasses = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                  } else if (log.type === 'compare') {
                    IconComponent = ArrowRightLeft;
                    colorClasses = 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
                  } else if (log.type === 'alert') {
                    IconComponent = Bell;
                    colorClasses = 'bg-purple-500/20 text-purple-400 border-purple-500/30';
                  }

                  const matchedProduct = log.productId
                    ? allProducts.find((p) => p.id === log.productId)
                    : undefined;

                  const previewImg = log.productPreviewUrl || matchedProduct?.previewUrl;

                  return (
                    <div
                      key={log.id}
                      className="relative bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md transition-all hover:border-slate-700"
                    >
                      {/* Timeline Dot Icon */}
                      <div
                        className={`absolute -left-[37px] top-4 p-1.5 rounded-full border shadow-sm ${colorClasses}`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>

                      <div className="flex items-center gap-3">
                        {previewImg && (
                          <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                            <img
                              src={previewImg}
                              alt={log.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{log.title}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-950 text-slate-400 border border-slate-800 uppercase">
                              {log.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{log.description}</p>
                          <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                            {formatRelativeTime(log.timestamp)} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                        {log.amountUsd !== undefined && (
                          <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                            {formatCurrency(log.amountUsd, currency)}
                          </span>
                        )}

                        {matchedProduct && onSelectProduct && (
                          <button
                            onClick={() => onSelectProduct(matchedProduct)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 border border-slate-700"
                          >
                            <span>View Asset</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}


      {/* BULK DOWNLOAD CONFIRMATION & ARCHIVE GENERATOR MODAL */}
      {isBulkDownloadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl text-slate-100 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Bulk Assets ZIP Exporter</h3>
                  <p className="text-[11px] text-slate-400">
                    Packaging {targetCountToDownload} item{targetCountToDownload > 1 ? 's' : ''} into a single ZIP archive
                  </p>
                </div>
              </div>

              {!isGeneratingZip && (
                <button
                  onClick={() => setIsBulkDownloadModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* If Generating: Progress Bar */}
            {isGeneratingZip ? (
              <div className="space-y-4 py-4 text-center">
                <Loader2 className="w-10 h-10 text-sky-400 animate-spin mx-auto" />
                <div>
                  <p className="text-xs font-bold text-white">{zipStatusText}</p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">{zipProgress}% completed</p>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className="bg-sky-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${zipProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              /* Archive Customization Options */
              <div className="space-y-4">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-sky-400" />
                    <span>Archive Contents Included:</span>
                  </p>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={includeCertificates}
                      onChange={(e) => setIncludeCertificates(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
                    />
                    <span className="text-slate-300">License Certificates (.txt) for each asset</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeReadme}
                      onChange={(e) => setIncludeReadme(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
                    />
                    <span className="text-slate-300">00_VAULT_INDEX_SUMMARY.txt master index</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMetadataJson}
                      onChange={(e) => setIncludeMetadataJson(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
                    />
                    <span className="text-slate-300">JSON Metadata & Order reference records</span>
                  </label>
                </div>

                <div className="p-3 bg-sky-950/20 border border-sky-500/20 rounded-xl text-[11px] text-sky-300">
                  <p>
                    <strong>Note:</strong> Your browser will assemble a clean, structured ZIP file containing folder structures for each selected digital asset and serial key certificate.
                  </p>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setIsBulkDownloadModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={executeBulkZipDownload}
                    className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Generate & Download ZIP</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

