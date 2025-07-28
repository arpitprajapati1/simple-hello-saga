/**
 * Utility functions for formatting numbers, prices, and percentages
 */

export const formatPrice = (price: number): string => {
  if (price === 0) return '$0.00';
  
  if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  } else if (price < 1) {
    return `$${price.toFixed(4)}`;
  } else if (price < 10) {
    return `$${price.toFixed(3)}`;
  } else {
    return `$${price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
};

export const formatNumber = (num: number): string => {
  if (num === 0) return '0';
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (absNum >= 1e12) {
    return `${sign}$${(absNum / 1e12).toFixed(2)}T`;
  } else if (absNum >= 1e9) {
    return `${sign}$${(absNum / 1e9).toFixed(2)}B`;
  } else if (absNum >= 1e6) {
    return `${sign}$${(absNum / 1e6).toFixed(2)}M`;
  } else if (absNum >= 1e3) {
    return `${sign}$${(absNum / 1e3).toFixed(2)}K`;
  } else {
    return `${sign}$${absNum.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }
};

export const formatPercentage = (percentage: number): string => {
  if (percentage === 0) return '0.00%';
  
  const sign = percentage > 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
};

export const formatVolume = (volume: number): string => {
  return formatNumber(volume);
};

export const formatMarketCap = (marketCap: number): string => {
  return formatNumber(marketCap);
};

export const formatSupply = (supply: number | null | undefined): string => {
  if (!supply) return 'N/A';
  
  const absSupply = Math.abs(supply);
  
  if (absSupply >= 1e12) {
    return `${(absSupply / 1e12).toFixed(2)}T`;
  } else if (absSupply >= 1e9) {
    return `${(absSupply / 1e9).toFixed(2)}B`;
  } else if (absSupply >= 1e6) {
    return `${(absSupply / 1e6).toFixed(2)}M`;
  } else if (absSupply >= 1e3) {
    return `${(absSupply / 1e3).toFixed(2)}K`;
  } else {
    return absSupply.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }
};

export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
};

export const formatCompactNumber = (num: number): string => {
  if (num === 0) return '0';
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (absNum >= 1e12) {
    return `${sign}${(absNum / 1e12).toFixed(1)}T`;
  } else if (absNum >= 1e9) {
    return `${sign}${(absNum / 1e9).toFixed(1)}B`;
  } else if (absNum >= 1e6) {
    return `${sign}${(absNum / 1e6).toFixed(1)}M`;
  } else if (absNum >= 1e3) {
    return `${sign}${(absNum / 1e3).toFixed(1)}K`;
  } else {
    return `${sign}${absNum.toFixed(0)}`;
  }
};