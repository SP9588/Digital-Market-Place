import { Currency, CurrencyRate } from '../types/marketplace';

export const CURRENCIES: Record<Currency, CurrencyRate> = {
  USD: { code: 'USD', symbol: '$', rate: 1.0 },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', rate: 0.78 },
  INR: { code: 'INR', symbol: '₹', rate: 83.5 },
  JPY: { code: 'JPY', symbol: '¥', rate: 155.0 },
  CAD: { code: 'CAD', symbol: 'CA$', rate: 1.36 },
  AUD: { code: 'AUD', symbol: 'A$', rate: 1.52 },
};

export function convertPrice(
  amount: number,
  targetCurrency: Currency = 'USD',
  sourceCurrency: Currency = 'USD'
): number {
  const sourceRate = CURRENCIES[sourceCurrency]?.rate || 1.0;
  const targetRate = CURRENCIES[targetCurrency]?.rate || 1.0;
  const usdAmount = amount / sourceRate;
  return usdAmount * targetRate;
}

export function formatCurrency(amountInUSD: number, currency: Currency = 'USD'): string {
  const currencyInfo = CURRENCIES[currency] || CURRENCIES.USD;
  const converted = amountInUSD * currencyInfo.rate;

  if (currency === 'JPY') {
    return `${currencyInfo.symbol}${Math.round(converted).toLocaleString()}`;
  } else if (currency === 'INR') {
    return `${currencyInfo.symbol}${converted.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  } else {
    return `${currencyInfo.symbol}${converted.toFixed(2)}`;
  }
}
