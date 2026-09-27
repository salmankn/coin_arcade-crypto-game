export const BTC_USD_PRICE = 64850;
export const ETH_USD_PRICE = 3450;
export const SOL_USD_PRICE = 152;
export const RUSH_USD_PRICE = 0.045;

export function satsToBtc(sats: number): number {
  return sats / 100000000;
}

export function satsToUsd(sats: number, btcPrice: number = BTC_USD_PRICE): number {
  return (sats / 100000000) * btcPrice;
}

export function formatSats(sats: number): string {
  if (sats >= 1000000) {
    return `${(sats / 1000000).toFixed(2)}M`;
  }
  return Math.round(sats).toLocaleString('en-US');
}

export function formatUsd(val: number): string {
  if (val < 0.01 && val > 0) {
    return `$${val.toFixed(4)}`;
  }
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address || address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

export function generateTxHash(network: 'lightning' | 'solana' | 'ethereum'): string {
  const hex = '0123456789abcdef';
  if (network === 'lightning') {
    let hash = 'lnbc';
    for (let i = 0; i < 32; i++) {
      hash += hex[Math.floor(Math.random() * hex.length)];
    }
    return hash;
  }
  let hash = '0x';
  for (let i = 0; i < 40; i++) {
    hash += hex[Math.floor(Math.random() * hex.length)];
  }
  return hash;
}
