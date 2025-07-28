import React from 'react';
import { Search, RotateCcw, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { TimeFrame, SortBy, SizeBy } from '../services/cryptoApi';

interface FilterPanelProps {
  timeframe: TimeFrame;
  setTimeframe: (timeframe: TimeFrame) => void;
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
  sizeBy: SizeBy;
  setSizeBy: (sizeBy: SizeBy) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showOnlyGainers: boolean;
  showOnlyLosers: boolean;
  toggleGainersFilter: () => void;
  toggleLosersFilter: () => void;
  clearFilters: () => void;
  refreshData: () => void;
  loading: boolean;
  totalCoins: number;
  gainersCount: number;
  losersCount: number;
  lastUpdated: Date | null;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  timeframe,
  setTimeframe,
  sortBy,
  setSortBy,
  sizeBy,
  setSizeBy,
  searchQuery,
  setSearchQuery,
  showOnlyGainers,
  showOnlyLosers,
  toggleGainersFilter,
  toggleLosersFilter,
  clearFilters,
  refreshData,
  loading,
  totalCoins,
  gainersCount,
  losersCount,
  lastUpdated,
}) => {
  const timeframes: { value: TimeFrame; label: string }[] = [
    { value: '1h', label: '1H' },
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
  ];

  const sortOptions: { value: SortBy; label: string }[] = [
    { value: 'market_cap', label: 'Market Cap' },
    { value: 'volume', label: 'Volume' },
    { value: 'price_change_24h', label: 'Price Change' },
  ];

  const sizeOptions: { value: SizeBy; label: string }[] = [
    { value: 'market_cap', label: 'Market Cap' },
    { value: 'volume', label: '24h Volume' },
  ];

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4 space-y-4">
      {/* Top Row - Search and Refresh */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search cryptocurrencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {lastUpdated && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Timeframe */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Time:</span>
          <div className="flex rounded-md overflow-hidden border border-border">
            {timeframes.map((tf) => (
              <Button
                key={tf.value}
                variant={timeframe === tf.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeframe(tf.value)}
                className="rounded-none"
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="bg-background border border-border rounded px-2 py-1 text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Size By */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Size:</span>
          <select
            value={sizeBy}
            onChange={(e) => setSizeBy(e.target.value as SizeBy)}
            className="bg-background border border-border rounded px-2 py-1 text-sm"
          >
            {sizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Buttons and Stats */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={showOnlyGainers ? 'default' : 'outline'}
            size="sm"
            onClick={toggleGainersFilter}
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Gainers
            <Badge variant="secondary" className="ml-1">
              {gainersCount}
            </Badge>
          </Button>
          
          <Button
            variant={showOnlyLosers ? 'default' : 'outline'}
            size="sm"
            onClick={toggleLosersFilter}
            className="flex items-center gap-2"
          >
            <TrendingDown className="w-4 h-4" />
            Losers
            <Badge variant="secondary" className="ml-1">
              {losersCount}
            </Badge>
          </Button>

          {(showOnlyGainers || showOnlyLosers || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{totalCoins} coins</span>
          <span className="crypto-gain">{gainersCount} gaining</span>
          <span className="crypto-loss">{losersCount} losing</span>
        </div>
      </div>
    </div>
  );
};