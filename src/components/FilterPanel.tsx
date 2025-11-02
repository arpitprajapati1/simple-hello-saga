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
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
      {/* Top Row - Search and Refresh */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-sm relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search cryptocurrencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-xs sm:text-sm">Refresh</span>
          </Button>
          
          {lastUpdated && (
            <span className="text-xs text-muted-foreground hidden md:block">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
        {/* Timeframe */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground hidden sm:inline">Time:</span>
          <div className="flex rounded-md overflow-hidden border border-border">
            {timeframes.map((tf) => (
              <Button
                key={tf.value}
                variant={timeframe === tf.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeframe(tf.value)}
                className="rounded-none text-xs sm:text-sm h-8 px-2 sm:px-3"
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="bg-background border border-border rounded px-2 py-1 text-xs sm:text-sm h-8"
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
          <span className="text-xs sm:text-sm font-medium text-muted-foreground hidden sm:inline">Size:</span>
          <select
            value={sizeBy}
            onChange={(e) => setSizeBy(e.target.value as SizeBy)}
            className="bg-background border border-border rounded px-2 py-1 text-xs sm:text-sm h-8"
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
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant={showOnlyGainers ? 'default' : 'outline'}
            size="sm"
            onClick={toggleGainersFilter}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 flex-1 sm:flex-initial"
          >
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Gainers</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {gainersCount}
            </Badge>
          </Button>
          
          <Button
            variant={showOnlyLosers ? 'default' : 'outline'}
            size="sm"
            onClick={toggleLosersFilter}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 flex-1 sm:flex-initial"
          >
            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Losers</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {losersCount}
            </Badge>
          </Button>

          {(showOnlyGainers || showOnlyLosers || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground w-full sm:w-auto justify-between sm:justify-end">
          <span>{totalCoins} coins</span>
          <span className="crypto-gain">{gainersCount} gaining</span>
          <span className="crypto-loss">{losersCount} losing</span>
        </div>
      </div>
    </div>
  );
};