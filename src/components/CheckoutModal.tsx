import React, { useState, useMemo } from 'react';
import { CartItem, Currency, Order } from '../types/marketplace';
import { formatCurrency, convertPrice } from '../utils/currency';
import { PaymentGatewayIntegration } from './PaymentGatewayIntegration';
import {
  X,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Download,
  Copy,
  Check,
} from 'lucide-react';

interface CheckoutModalProps {
  cartItems: CartItem[];
  currency: Currency;
  onClose: () => void;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  cartItems,
  currency,
  onClose,
  onOrderCompleted,
}) => {
  const [gateway, setGateway] = useState<'upi_qr' | 'stripe' | 'razorpay' | 'paypal' | 'crypto'>('upi_qr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [buyerEmail, setBuyerEmail] = useState('user@openocean.io');
  const [buyerName, setBuyerName] = useState('Alex Rivera');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedUpiId, setCopiedUpiId] = useState(false);

  // Payee / Developer Information
  const payeeName = 'Santosh Prasad (App Developer & Owner)';
  const payeeUpiId = 'santosh.developer@upi';
  const payeePhone = '+91 98765 43210';

  // Secret Key input for UPI / Direct Payee transfer
  const [secretKeyInput, setSecretKeyInput] = useState('');
  const [secretKeyError, setSecretKeyError] = useState<string | null>(null);
  const [verifiedSecretKey, setVerifiedSecretKey] = useState<string | null>(null);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const openOceanFee = Math.round(subtotal * 0.10 * 100) / 100;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + tax;

  // Convert total to INR for UPI app context
  const totalInInr = useMemo(() => {
    return Math.round(convertPrice(total, 'INR', currency) * 100) / 100;
  }, [total, currency]);

  // Generate UPI payment string for QR code & deep links
  const upiPayString = `upi://pay?pa=${payeeUpiId}&pn=${encodeURIComponent('Santosh Prasad Developer')}&am=${totalInInr}&cu=INR&tn=${encodeURIComponent('Open Ocean Digital Vault Order')}`;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(payeeUpiId);
    setCopiedUpiId(true);
    setTimeout(() => setCopiedUpiId(false), 2500);
  };

  const handleGenerateSampleSecretKey = () => {
    const sample = `SEC-${Math.floor(100000 + Math.random() * 900000)}-UPI`;
    setSecretKeyInput(sample);
    setSecretKeyError(null);
  };

  const handleProcessPayment = async () => {
    setSecretKeyError(null);

    // If UPI/QR mode, enforce Secret Key / UTR input
    if (gateway === 'upi_qr') {
      if (!secretKeyInput || secretKeyInput.trim().length < 4) {
        setSecretKeyError('Please enter the Secret Verification Key or 12-digit UTR/Txn ID received after transfer.');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          currency,
          paymentGateway: gateway,
          buyerEmail,
          buyerName,
          secretKey: secretKeyInput,
        }),
      });

      const data = await res.json();

      setTimeout(() => {
        setIsProcessing(false);
        const newOrder: Order = {
          id: data.orderId || 'ORD-' + Math.floor(Math.random() * 1000000),
          items: cartItems,
          subtotal,
          marketplaceFee: openOceanFee,
          tax,
          total,
          currency,
          paymentGateway: gateway,
          paymentMethodDetails:
            gateway === 'upi_qr'
              ? `Payee UPI (${payeeUpiId}) • Secret Key: ${secretKeyInput}`
              : `${gateway.toUpperCase()} Instant Settlement`,
          status: 'completed',
          date: new Date().toLocaleDateString(),
          invoiceNumber: data.invoiceNumber || 'INV-2026-9081',
          buyerEmail,
          buyerName,
          licenseKeys: data.licenseKeys || {},
          downloadLinks: data.downloadLinks || {},
        };

        setCompletedOrder(newOrder);
        onOrderCompleted(newOrder);
      }, 1500);
    } catch (err) {
      setIsProcessing(false);
      alert('Checkout error. Please try again.');
    }
  };

  const copyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 my-auto animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">
              {completedOrder ? 'Order Complete & Vault Unlocked' : 'Open Ocean Secure Checkout'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!completedOrder ? (
            <div className="space-y-6">
              {/* Cart Summary List */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Digital Items ({cartItems.length})
                </p>
                <div className="max-h-36 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {cartItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.previewUrl}
                          alt={item.product.title}
                          className="w-10 h-10 rounded object-cover border border-slate-800"
                        />
                        <div>
                          <p className="font-bold text-slate-200 line-clamp-1">{item.product.title}</p>
                          <p className="text-[10px] text-sky-400 uppercase tracking-wider font-semibold">
                            License: {item.selectedLicense}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-200">
                        {formatCurrency(item.price, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Gateway & Payee UPI Secret Key Integration */}
              <PaymentGatewayIntegration
                selectedGateway={gateway}
                onGatewayChange={(gw) => setGateway(gw)}
                totalAmount={total}
                totalInInr={totalInInr}
                currency={currency}
                secretKeyInput={secretKeyInput}
                onSecretKeyChange={(val) => {
                  setSecretKeyInput(val);
                  setSecretKeyError(null);
                }}
                secretKeyError={secretKeyError}
              />

              {/* Billing Customer Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Delivery Email</label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Fee Transparency Box */}
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-200">{formatCurrency(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Open Ocean Commission (10% Creator Fee included):</span>
                  <span className="font-mono text-sky-400">{formatCurrency(openOceanFee, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>VAT / Sales Tax (5%):</span>
                  <span className="font-mono text-slate-200">{formatCurrency(tax, currency)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                  <span>Total Amount ({currency}):</span>
                  <span className="font-mono text-emerald-400 text-base">
                    {formatCurrency(total, currency)}
                    {gateway === 'upi_qr' && ` (~₹${totalInInr})`}
                  </span>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                disabled={isProcessing}
                onClick={handleProcessPayment}
                className="w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm transition-all cursor-pointer shadow-xl shadow-sky-500/20 active:scale-98 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>
                      Verifying {gateway === 'upi_qr' ? 'Secret Key & Payee Settlement' : gateway.toUpperCase()}...
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {gateway === 'upi_qr'
                        ? `Verify Secret Key & Unlock Vault (${formatCurrency(total, currency)})`
                        : `Pay ${formatCurrency(total, currency)} & Unlock Vault`}
                    </span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Order Completion Screen */
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white">Order Confirmed & Verified!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Order ID: <span className="font-mono text-sky-400 font-bold">{completedOrder.id}</span> • Invoice:{' '}
                  <span className="font-mono text-slate-300">{completedOrder.invoiceNumber}</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Receipt sent to <span className="text-slate-200 font-semibold">{completedOrder.buyerEmail}</span>
                </p>
              </div>

              {/* Vault Downloads & License Keys */}
              <div className="text-left space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <p className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    Purchased Digital Vault
                  </p>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Payee Verified
                  </span>
                </div>

                {completedOrder.items.map((item, i) => {
                  const pId = item.product.id;
                  const licKey = completedOrder.licenseKeys[pId] || 'LIC-OPENOCEAN-KEYS';

                  return (
                    <div key={i} className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white line-clamp-1">
                          {item.product.title}
                        </span>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Downloading digital asset archive (.ZIP / Bundle) for ${item.product.title}`);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Archive</span>
                        </a>
                      </div>

                      <div className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 text-xs font-mono">
                        <span className="text-slate-400 text-[10px]">Serial License:</span>
                        <span className="text-sky-300 font-bold">{licKey}</span>
                        <button
                          onClick={() => copyLicenseKey(licKey)}
                          className="p-1 text-slate-400 hover:text-white cursor-pointer"
                          title="Copy Key"
                        >
                          {copiedKey === licKey ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Return to Marketplace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
