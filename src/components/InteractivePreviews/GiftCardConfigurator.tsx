import React, { useState } from 'react';
import { Gift, ShieldCheck, Copy, Check } from 'lucide-react';
import { Currency } from '../../types/marketplace';
import { formatCurrency } from '../../utils/currency';

interface GiftCardConfiguratorProps {
  title: string;
  brandName?: string;
  price: number;
  currency: Currency;
}

export const GiftCardConfigurator: React.FC<GiftCardConfiguratorProps> = ({
  title,
  brandName = 'Open Ocean Authorised Brand',
  price,
  currency,
}) => {
  const [copied, setCopied] = useState(false);
  const sampleVoucherCode = 'OCEAN-HOTEL-2026-X9872';

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleVoucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-emerald-400" />
          <div>
            <h4 className="font-semibold text-sm line-clamp-1">{title}</h4>
            <p className="text-xs text-slate-400">Official Authorised Brand Digital Voucher</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Brand Verified
        </span>
      </div>

      {/* Gift Card Visual */}
      <div className="relative w-full h-48 rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-sky-950 p-6 border border-sky-500/30 flex flex-col justify-between shadow-2xl overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-sky-400 uppercase">
              {brandName}
            </p>
            <h3 className="text-lg font-bold text-white mt-0.5">Digital e-Gift Pass</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Face Value</p>
            <p className="text-2xl font-black text-emerald-400 font-mono">
              {formatCurrency(price, currency)}
            </p>
          </div>
        </div>

        <div className="bg-slate-950/80 backdrop-blur rounded-lg p-3 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Sample Voucher Serial Key</p>
            <p className="font-mono text-sm font-bold text-sky-300 tracking-wider">
              {sampleVoucherCode}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Copy Sample Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
