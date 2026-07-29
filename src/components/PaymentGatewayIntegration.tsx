import React, { useState } from 'react';
import {
  QrCode,
  Key,
  Smartphone,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertCircle,
  Lock,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { Currency } from '../types/marketplace';
import { formatCurrency } from '../utils/currency';

interface PaymentGatewayIntegrationProps {
  selectedGateway: 'upi_qr' | 'stripe' | 'razorpay' | 'paypal' | 'crypto';
  onGatewayChange: (gateway: 'upi_qr' | 'stripe' | 'razorpay' | 'paypal' | 'crypto') => void;
  totalAmount: number;
  totalInInr: number;
  currency: Currency;
  secretKeyInput: string;
  onSecretKeyChange: (key: string) => void;
  secretKeyError: string | null;
}

export const PaymentGatewayIntegration: React.FC<PaymentGatewayIntegrationProps> = ({
  selectedGateway,
  onGatewayChange,
  totalAmount,
  totalInInr,
  currency,
  secretKeyInput,
  onSecretKeyChange,
  secretKeyError,
}) => {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [scanStatusMsg, setScanStatusMsg] = useState<string | null>(null);

  // Payee / Developer Information
  const payeeName = 'Santosh Prasad (App Developer & Owner)';
  const payeeUpiId = 'santosh.developer@upi';

  const upiPayString = `upi://pay?pa=${payeeUpiId}&pn=${encodeURIComponent('Santosh Prasad Developer')}&am=${totalInInr}&cu=INR&tn=${encodeURIComponent('Open Ocean Digital Vault Order')}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(payeeUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSimulateScan = () => {
    setIsScanningActive(true);
    setScanStatusMsg('Scanning Payee QR Code...');
    setTimeout(() => {
      setIsScanningActive(false);
      setScanStatusMsg('Payee UPI ID Verified! (Santosh Prasad)');
      setTimeout(() => setScanStatusMsg(null), 3000);
    }, 1800);
  };

  const handleAutoFillSampleSecretKey = () => {
    const sampleKey = `SEC-API-${Math.floor(100000 + Math.random() * 900000)}-UPI`;
    onSecretKeyChange(sampleKey);
  };

  return (
    <div className="space-y-4">
      {/* Gateway Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Select Payment Method
          </label>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Payee Direct Settlement
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {[
            { id: 'upi_qr', label: 'Payee UPI QR', sub: 'PhonePe, GPay, Paytm' },
            { id: 'stripe', label: 'Stripe Cards', sub: 'Credit / Debit' },
            { id: 'razorpay', label: 'Razorpay', sub: 'Banking & Net' },
            { id: 'paypal', label: 'PayPal', sub: 'Express Checkout' },
            { id: 'crypto', label: 'Crypto Pay', sub: 'USDC / Solana' },
          ].map((gw) => (
            <button
              key={gw.id}
              type="button"
              onClick={() => onGatewayChange(gw.id as any)}
              className={`p-2.5 rounded-xl border font-semibold cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                selectedGateway === gw.id
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-lg shadow-sky-500/10 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="text-xs">{gw.label}</span>
              <span className="text-[9px] text-slate-500 font-mono">{gw.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Payee UPI ID Scanner & Merchant Secret Key Box */}
      {selectedGateway === 'upi_qr' && (
        <div className="p-4 bg-slate-950/90 rounded-2xl border border-sky-500/30 space-y-4 shadow-inner animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                <QrCode className="w-4 h-4" />
                <span>Payee UPI QR Scanner & Direct Wallet Payment</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Payee Owner: <strong className="text-white">{payeeName}</strong>
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400">Amount:</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {formatCurrency(totalAmount, currency)} (~₹{totalInInr})
              </span>
            </div>
          </div>

          {/* QR Code Scanner Interface */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Visual QR & Scanner Camera Frame */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-white rounded-xl border-2 border-sky-400/80 shadow-lg shadow-sky-500/10 relative overflow-hidden">
              {/* Scanning Overlay Animation */}
              {isScanningActive && (
                <div className="absolute inset-0 bg-sky-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-white p-2">
                  <Camera className="w-8 h-8 text-sky-400 animate-pulse mb-1" />
                  <span className="text-xs font-bold animate-pulse text-sky-300">Scanning QR...</span>
                  <div className="w-24 h-1 bg-sky-500 rounded-full mt-2 animate-bounce" />
                </div>
              )}

              <div className="relative w-36 h-36 flex items-center justify-center bg-white p-2">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950 fill-current">
                  {/* Position squares */}
                  <rect x="5" y="5" width="28" height="28" rx="4" fill="currentColor" />
                  <rect x="9" y="9" width="20" height="20" rx="2" fill="white" />
                  <rect x="13" y="13" width="12" height="12" rx="1" fill="currentColor" />

                  <rect x="67" y="5" width="28" height="28" rx="4" fill="currentColor" />
                  <rect x="71" y="9" width="20" height="20" rx="2" fill="white" />
                  <rect x="75" y="13" width="12" height="12" rx="1" fill="currentColor" />

                  <rect x="5" y="67" width="28" height="28" rx="4" fill="currentColor" />
                  <rect x="9" y="71" width="20" height="20" rx="2" fill="white" />
                  <rect x="13" y="75" width="12" height="12" rx="1" fill="currentColor" />

                  {/* QR Matrix */}
                  <rect x="38" y="8" width="6" height="6" />
                  <rect x="48" y="8" width="12" height="6" />
                  <rect x="38" y="18" width="6" height="12" />
                  <rect x="48" y="22" width="6" height="6" />

                  <rect x="8" y="38" width="12" height="6" />
                  <rect x="22" y="38" width="6" height="6" />
                  <rect x="8" y="48" width="6" height="12" />
                  <rect x="18" y="52" width="10" height="6" />

                  <rect x="38" y="38" width="24" height="24" rx="2" fill="#0284c7" />
                  <text x="50" y="54" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">
                    UPI
                  </text>

                  <rect x="68" y="38" width="12" height="6" />
                  <rect x="84" y="38" width="8" height="12" />
                  <rect x="72" y="48" width="6" height="12" />
                  <rect x="82" y="52" width="10" height="8" />

                  <rect x="38" y="68" width="6" height="12" />
                  <rect x="48" y="68" width="12" height="6" />
                  <rect x="48" y="78" width="6" height="14" />
                  <rect x="38" y="84" width="8" height="8" />

                  <rect x="68" y="68" width="14" height="6" />
                  <rect x="86" y="68" width="6" height="12" />
                  <rect x="68" y="78" width="6" height="14" />
                  <rect x="78" y="82" width="14" height="10" />
                </svg>
              </div>

              <button
                type="button"
                onClick={handleSimulateScan}
                className="mt-1 px-3 py-1 rounded bg-slate-900 text-sky-400 text-[10px] font-bold hover:bg-slate-800 cursor-pointer flex items-center gap-1 transition-colors"
              >
                <Camera className="w-3 h-3" />
                <span>Simulate Camera Scan</span>
              </button>
            </div>

            {/* Payee Info & Quick Wallet Launch */}
            <div className="md:col-span-7 space-y-3 text-xs">
              {scanStatusMsg && (
                <div className="p-2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{scanStatusMsg}</span>
                </div>
              )}

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                  Payee Developer UPI ID
                </span>
                <div className="flex items-center justify-between gap-2">
                  <code className="font-mono font-bold text-sky-300 text-xs">{payeeUpiId}</code>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 border border-sky-500/30"
                  >
                    {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUpi ? 'Copied!' : 'Copy UPI'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-medium">
                  Supported Payment Sources & Transfer Platforms:
                </p>
                <div className="flex flex-wrap gap-1">
                  {['PhonePe', 'Google Pay', 'Paytm', 'PayPal', 'Amazon Pay', 'BHIM'].map((app) => (
                    <span
                      key={app}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-semibold flex items-center gap-1"
                    >
                      <Smartphone className="w-2.5 h-2.5 text-sky-400" />
                      {app}
                    </span>
                  ))}
                </div>
              </div>

              <a
                href={upiPayString}
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Launch UPI App (PhonePe / GPay / Paytm)</span>
              </a>
            </div>
          </div>

          {/* MERCHANT API SECRET KEY INPUT FIELD */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                <span>Merchant API Secret Key / Transaction UTR ID</span>
              </label>
              <button
                type="button"
                onClick={handleAutoFillSampleSecretKey}
                className="text-[10px] text-sky-400 hover:underline font-mono flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-2.5 h-2.5" /> Auto-fill Sample Secret Key
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={secretKeyInput}
                onChange={(e) => onSecretKeyChange(e.target.value)}
                placeholder="Enter Merchant API Secret Key (e.g. SEC-API-908123-UPI or 12-digit UTR)"
                className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              {secretKeyInput && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Key Staged
                </span>
              )}
            </div>

            {secretKeyError ? (
              <p className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {secretKeyError}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400">
                After making the transaction to the payee, enter your merchant API secret key or UTR reference to instantly verify and unlock your digital vault download.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
