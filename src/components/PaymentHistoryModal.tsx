import React, { useState } from 'react';
import { Order, Currency } from '../types/marketplace';
import { formatCurrency, convertPrice } from '../utils/currency';
import {
  X,
  History,
  ShieldCheck,
  Search,
  Copy,
  Check,
  Download,
  Trash2,
  Key,
  QrCode,
  CreditCard,
  Calendar,
  ExternalLink,
  CheckCircle2,
  FileText,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  currency: Currency;
  onClearHistory: () => void;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  currency,
  onClearHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [filterGateway, setFilterGateway] = useState<string>('all');

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredOrders = orders.filter((ord) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      ord.id.toLowerCase().includes(query) ||
      ord.paymentMethodDetails.toLowerCase().includes(query) ||
      ord.invoiceNumber.toLowerCase().includes(query) ||
      ord.items.some((item) => item.product.title.toLowerCase().includes(query));

    const matchesGateway =
      filterGateway === 'all' ||
      (filterGateway === 'upi_qr' && ord.paymentGateway === 'upi_qr') ||
      (filterGateway === 'other' && ord.paymentGateway !== 'upi_qr');

    return matchesQuery && matchesGateway;
  });

  const totalSpentUsd = orders.reduce((sum, ord) => sum + ord.total, 0);
  const upiCount = orders.filter((ord) => ord.paymentGateway === 'upi_qr').length;

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(orders, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `open_ocean_payment_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCsv = () => {
    if (orders.length === 0) return;

    const headers = [
      'Order ID',
      'Date',
      'Invoice Number',
      'Payment Method',
      'Gateway',
      'Item Count',
      'Items Purchased',
      'License Keys',
      'Total Amount (USD)',
      'Currency',
      'Status',
    ];

    const escapeCsv = (str: string | number) => {
      const stringified = String(str ?? '');
      if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
        return `"${stringified.replace(/"/g, '""')}"`;
      }
      return stringified;
    };

    const rows = orders.map((ord) => {
      const itemTitles = ord.items.map((i) => `${i.product.title} (${i.selectedLicense})`).join('; ');
      const licenseKeys = ord.items.map((i) => i.licenseKey).filter(Boolean).join('; ');

      return [
        ord.id,
        ord.date,
        ord.invoiceNumber,
        ord.paymentMethodDetails,
        ord.paymentGateway || 'standard',
        ord.items.length,
        itemTitles,
        licenseKeys,
        ord.total,
        ord.currency,
        'Settled',
      ]
        .map(escapeCsv)
        .join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `open_ocean_payment_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-slate-100 my-auto animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-white">Payment & UPI Transaction History</h3>
              <p className="text-[11px] text-slate-400">
                Stored locally • Payee Settlement Ledger (Santosh Prasad)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Total Transactions
              </span>
              <p className="text-xl font-extrabold font-mono text-white">{orders.length}</p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Total Amount Paid
              </span>
              <p className="text-xl font-extrabold font-mono text-emerald-400">
                {formatCurrency(totalSpentUsd, currency)}
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-sky-500/30 space-y-1">
              <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider block flex items-center gap-1">
                <QrCode className="w-3 h-3" /> Payee UPI Transfers
              </span>
              <p className="text-xl font-extrabold font-mono text-sky-300">
                {upiCount} <span className="text-xs font-normal text-slate-400">orders</span>
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Order ID, Item, Key..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setFilterGateway('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    filterGateway === 'all'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterGateway('upi_qr')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                    filterGateway === 'upi_qr'
                      ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <QrCode className="w-3 h-3" /> UPI Only
                </button>
              </div>

              {orders.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleExportCsv}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title="Export transaction history as a CSV file"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={handleExportJson}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-700"
                    title="Export transaction history as a JSON file"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span className="hidden sm:inline">JSON</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Transactions List */}
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/50 rounded-xl border border-slate-800/80 p-6 space-y-2">
                <History className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-400">No payment records found.</p>
                <p className="text-[11px] text-slate-500">
                  {orders.length === 0
                    ? 'Purchases made via UPI QR or Checkout will be saved here automatically.'
                    : 'Try clearing your search query.'}
                </p>
              </div>
            ) : (
              filteredOrders.map((ord) => {
                const totalInInr = Math.round(convertPrice(ord.total, 'INR', ord.currency as Currency) * 100) / 100;

                return (
                  <div
                    key={ord.id}
                    className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified & Settled
                        </span>
                        <span className="font-mono font-bold text-xs text-sky-400">{ord.id}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{ord.date}</span>
                        <span className="text-slate-600">•</span>
                        <span className="font-mono text-emerald-400 font-bold text-sm">
                          {formatCurrency(ord.total, ord.currency as Currency)}
                          {ord.paymentGateway === 'upi_qr' && ` (~₹${totalInInr})`}
                        </span>
                      </div>
                    </div>

                    {/* Gateway & Secret Key Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80 space-y-1">
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                          Payment Gateway / Method
                        </span>
                        <p className="font-mono font-semibold text-slate-200 line-clamp-1">
                          {ord.paymentMethodDetails}
                        </p>
                      </div>

                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80 space-y-1">
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                          Invoice / Receipt
                        </span>
                        <p className="font-mono font-semibold text-slate-200">{ord.invoiceNumber}</p>
                      </div>
                    </div>

                    {/* Purchased Items */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                        Purchased Digital Items ({ord.items.length})
                      </span>
                      <div className="space-y-1">
                        {ord.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs p-1.5 bg-slate-900/60 rounded border border-slate-800/50"
                          >
                            <span className="text-slate-300 font-medium line-clamp-1">
                              {item.product.title} ({item.selectedLicense})
                            </span>
                            <span className="font-mono text-slate-400 font-semibold">
                              {formatCurrency(item.price, ord.currency as Currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-between text-[11px]">
                      <button
                        onClick={() => handleCopy(ord.id, `ord-${ord.id}`)}
                        className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-mono"
                      >
                        {copiedText === `ord-${ord.id}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedText === `ord-${ord.id}` ? 'Order ID Copied!' : 'Copy Order ID'}</span>
                      </button>

                      <span className="text-slate-500 text-[10px]">
                        Payee: Santosh Prasad (Developer)
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            {orders.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your local payment history logs?')) {
                    onClearHistory();
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Payment History</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer ml-auto"
            >
              Close History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
