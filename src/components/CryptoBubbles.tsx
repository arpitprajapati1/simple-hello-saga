import React, { useState } from 'react';
import { BubbleChart } from './BubbleChart';
import { FilterPanel } from './FilterPanel';
import { useCryptoData } from '../hooks/useCryptoData';
import { BubbleData, cryptoApi } from '../services/cryptoApi';
import { useToast } from '../hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from './ui/breadcrumb';

export const CryptoBubbles: React.FC = () => {
  const {
    bubbleData,
    loading,
    error,
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
    totalCoins,
    gainersCount,
    losersCount,
    lastUpdated,
  } = useCryptoData({
    limit: 100,
    autoRefresh: true,
    refreshInterval: 30000,
  });

  const { toast } = useToast();

  const handleBubbleClick = (bubble: BubbleData) => {
    const links = cryptoApi.getExternalLinks(bubble.id, bubble.symbol);
    
    // Show options to user
    toast({
      title: `${bubble.name} (${bubble.symbol})`,
      description: "Click to view on external sites",
      action: (
        <div className="flex gap-2">
          <button
            onClick={() => window.open(links.coinGecko, '_blank')}
            className="text-xs px-2 py-1 bg-primary/20 rounded hover:bg-primary/30"
          >
            CoinGecko
          </button>
          <button
            onClick={() => window.open(links.tradingView, '_blank')}
            className="text-xs px-2 py-1 bg-primary/20 rounded hover:bg-primary/30"
          >
            TradingView
          </button>
        </div>
      ),
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Crypto Bubbles
              </h1>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Bubble chart</BreadcrumbPage>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#" className="text-muted-foreground hover:text-foreground">
                      Coins heat map
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#" className="text-muted-foreground hover:text-foreground">
                      Crypto news
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Filter Panel */}
      <div className="container mx-auto px-4 py-4">
        <FilterPanel
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sizeBy={sizeBy}
          setSizeBy={setSizeBy}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showOnlyGainers={showOnlyGainers}
          showOnlyLosers={showOnlyLosers}
          toggleGainersFilter={toggleGainersFilter}
          toggleLosersFilter={toggleLosersFilter}
          clearFilters={clearFilters}
          refreshData={refreshData}
          loading={loading}
          totalCoins={totalCoins}
          gainersCount={gainersCount}
          losersCount={losersCount}
          lastUpdated={lastUpdated}
        />
      </div>

      {/* Bubble Chart */}
      <div className="container mx-auto px-4 pb-8">
        <div className="bg-card/30 backdrop-blur-sm border border-border rounded-lg p-4 min-h-[600px] flex items-center justify-center">
          {loading && bubbleData.length === 0 ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading cryptocurrency data...</p>
            </div>
          ) : bubbleData.length === 0 ? (
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No cryptocurrencies found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <BubbleChart
              data={bubbleData}
              onBubbleClick={handleBubbleClick}
              className="w-full h-full"
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              <p>Data provided by CoinGecko API</p>
              <p>Interactive bubble visualization with real-time updates</p>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Bubble size represents:</span>
              <span className="font-medium capitalize">{sizeBy.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};