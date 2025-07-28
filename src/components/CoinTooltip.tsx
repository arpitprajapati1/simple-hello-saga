import React from 'react';
import { BubbleData, cryptoApi } from '../services/cryptoApi';
import { formatNumber, formatPrice, formatPercentage } from '../utils/formatters';
import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';

interface CoinTooltipProps {
  data: BubbleData;
  x: number;
  y: number;
  onClose: () => void;
}

export const CoinTooltip: React.FC<CoinTooltipProps> = ({ data, x, y, onClose }) => {
  const links = cryptoApi.getExternalLinks(data.id, data.symbol);
  
  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const isPositive = data.priceChange24h > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div
      className="absolute z-50 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 min-w-[280px] max-w-[320px] crypto-card"
      style={{
        left: Math.min(x + 10, window.innerWidth - 340),
        top: Math.max(y - 10, 10),
        pointerEvents: 'auto',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={data.image}
          alt={data.name}
          className="w-8 h-8 rounded-full"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground truncate">{data.name}</h3>
          <p className="text-sm text-muted-foreground">{data.symbol}</p>
        </div>
      </div>

      {/* Price Info */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Price:</span>
          <span className="font-mono font-bold text-foreground">
            {formatPrice(data.price)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">24h Change:</span>
          <div className={`flex items-center gap-1 font-mono font-bold ${
            isPositive ? 'crypto-gain' : 'crypto-loss'
          }`}>
            <TrendIcon className="w-3 h-3" />
            {formatPercentage(data.priceChange24h)}
          </div>
        </div>

        {data.priceChange1h !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">1h Change:</span>
            <span className={`font-mono font-bold ${
              data.priceChange1h > 0 ? 'crypto-gain' : 'crypto-loss'
            }`}>
              {formatPercentage(data.priceChange1h)}
            </span>
          </div>
        )}

        {data.priceChange7d !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">7d Change:</span>
            <span className={`font-mono font-bold ${
              data.priceChange7d > 0 ? 'crypto-gain' : 'crypto-loss'
            }`}>
              {formatPercentage(data.priceChange7d)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Market Cap:</span>
          <span className="font-mono text-sm text-foreground">
            {formatNumber(data.marketCap)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">24h Volume:</span>
          <span className="font-mono text-sm text-foreground">
            {formatNumber(data.volume)}
          </span>
        </div>
      </div>

      {/* External Links */}
      <div className="border-t border-border pt-3">
        <p className="text-xs text-muted-foreground mb-2">View on:</p>
        <div className="flex gap-2">
          <button
            onClick={() => handleLinkClick(links.coinGecko)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-accent/20 hover:bg-accent/30 rounded transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            CoinGecko
          </button>
          <button
            onClick={() => handleLinkClick(links.coinMarketCap)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-accent/20 hover:bg-accent/30 rounded transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            CMC
          </button>
          <button
            onClick={() => handleLinkClick(links.tradingView)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-accent/20 hover:bg-accent/30 rounded transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            TradingView
          </button>
        </div>
      </div>
    </div>
  );
};