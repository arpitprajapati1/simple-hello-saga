import { useState, useEffect, useCallback, useRef } from 'react';
import { cryptoApi, CryptoCoin, BubbleData, TimeFrame, SortBy, SizeBy } from '../services/cryptoApi';
import { useToast } from './use-toast';

interface UseCryptoDataOptions {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useCryptoData = (options: UseCryptoDataOptions = {}) => {
  const {
    limit = 50,
    autoRefresh = true,
    refreshInterval = 60000, // 60 seconds
  } = options;

  const [coins, setCoins] = useState<CryptoCoin[]>([]);
  const [bubbleData, setBubbleData] = useState<BubbleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Filters
  const [timeframe, setTimeframe] = useState<TimeFrame>('24h');
  const [sortBy, setSortBy] = useState<SortBy>('market_cap');
  const [sizeBy, setSizeBy] = useState<SizeBy>('market_cap');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyGainers, setShowOnlyGainers] = useState(false);
  const [showOnlyLosers, setShowOnlyLosers] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);

      let data: CryptoCoin[];
      
      if (searchQuery.trim()) {
        data = await cryptoApi.searchCoins(searchQuery);
      } else {
        data = await cryptoApi.getCryptoData(limit, sortBy, timeframe);
      }

      // Apply filters
      let filteredData = data;
      
      if (showOnlyGainers) {
        filteredData = data.filter(coin => {
          const change = timeframe === '1h' 
            ? coin.price_change_percentage_1h_in_currency || 0
            : timeframe === '24h'
            ? coin.price_change_percentage_24h
            : coin.price_change_percentage_7d_in_currency || 0;
          return change > 0;
        });
      } else if (showOnlyLosers) {
        filteredData = data.filter(coin => {
          const change = timeframe === '1h' 
            ? coin.price_change_percentage_1h_in_currency || 0
            : timeframe === '24h'
            ? coin.price_change_percentage_24h
            : coin.price_change_percentage_7d_in_currency || 0;
          return change < 0;
        });
      }

      setCoins(filteredData);
      setBubbleData(cryptoApi.transformToBubbleData(filteredData, sizeBy, timeframe));
      setLastUpdated(new Date());
      
      if (showToast) {
        toast({
          title: "Data Updated",
          description: `Loaded ${filteredData.length} cryptocurrencies`,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [limit, sortBy, timeframe, sizeBy, searchQuery, showOnlyGainers, showOnlyLosers, toast]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    intervalRef.current = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchData]);

  // Update bubble data when filters change
  useEffect(() => {
    if (coins.length > 0) {
      setBubbleData(cryptoApi.transformToBubbleData(coins, sizeBy, timeframe));
    }
  }, [coins, sizeBy, timeframe]);

  const refreshData = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const toggleGainersFilter = useCallback(() => {
    setShowOnlyGainers(prev => !prev);
    setShowOnlyLosers(false);
  }, []);

  const toggleLosersFilter = useCallback(() => {
    setShowOnlyLosers(prev => !prev);
    setShowOnlyGainers(false);
  }, []);

  const clearFilters = useCallback(() => {
    setShowOnlyGainers(false);
    setShowOnlyLosers(false);
    setSearchQuery('');
  }, []);

  return {
    // Data
    coins,
    bubbleData,
    loading,
    error,
    lastUpdated,
    
    // Filters
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
    
    // Actions
    refreshData,
    toggleGainersFilter,
    toggleLosersFilter,
    clearFilters,
    
    // Stats
    totalCoins: coins.length,
    gainersCount: coins.filter(coin => {
      const change = timeframe === '1h' 
        ? coin.price_change_percentage_1h_in_currency || 0
        : timeframe === '24h'
        ? coin.price_change_percentage_24h
        : coin.price_change_percentage_7d_in_currency || 0;
      return change > 0;
    }).length,
    losersCount: coins.filter(coin => {
      const change = timeframe === '1h' 
        ? coin.price_change_percentage_1h_in_currency || 0
        : timeframe === '24h'
        ? coin.price_change_percentage_24h
        : coin.price_change_percentage_7d_in_currency || 0;
      return change < 0;
    }).length,
  };
};