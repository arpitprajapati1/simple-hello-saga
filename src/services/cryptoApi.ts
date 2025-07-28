import axios from 'axios';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_1h_in_currency?: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply?: number;
  max_supply?: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

export interface BubbleData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  marketCap: number;
  volume: number;
  priceChange1h?: number;
  priceChange24h: number;
  priceChange7d?: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  // D3 force simulation properties
  fx?: number | null;
  fy?: number | null;
}

export type TimeFrame = '1h' | '24h' | '7d';
export type SortBy = 'market_cap' | 'volume' | 'price_change_24h';
export type SizeBy = 'market_cap' | 'volume';

class CryptoApiService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: COINGECKO_BASE_URL,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });
  }

  async getCryptoData(
    limit: number = 100,
    sortBy: SortBy = 'market_cap',
    priceChangeTimeframe: TimeFrame = '24h'
  ): Promise<CryptoCoin[]> {
    try {
      const priceChangeParams = this.getPriceChangeParams(priceChangeTimeframe);
      
      const response = await this.axiosInstance.get('/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: `${sortBy}_desc`,
          per_page: limit,
          page: 1,
          sparkline: false,
          price_change_percentage: priceChangeParams,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      throw new Error('Failed to fetch cryptocurrency data');
    }
  }

  async searchCoins(query: string): Promise<CryptoCoin[]> {
    try {
      const response = await this.axiosInstance.get('/search', {
        params: { query },
      });

      // Get detailed data for search results
      const coinIds = response.data.coins.slice(0, 10).map((coin: any) => coin.id);
      
      if (coinIds.length === 0) return [];

      const detailResponse = await this.axiosInstance.get('/coins/markets', {
        params: {
          vs_currency: 'usd',
          ids: coinIds.join(','),
          price_change_percentage: '1h,24h,7d',
        },
      });

      return detailResponse.data;
    } catch (error) {
      console.error('Error searching coins:', error);
      return [];
    }
  }

  transformToBubbleData(
    coins: CryptoCoin[],
    sizeBy: SizeBy = 'market_cap',
    timeframe: TimeFrame = '24h'
  ): BubbleData[] {
    const maxSize = Math.max(...coins.map(coin => 
      sizeBy === 'market_cap' ? coin.market_cap : coin.total_volume
    ));
    
    const minSize = Math.min(...coins.map(coin => 
      sizeBy === 'market_cap' ? coin.market_cap : coin.total_volume
    ));

    return coins.map(coin => {
      const sizeValue = sizeBy === 'market_cap' ? coin.market_cap : coin.total_volume;
      const normalizedSize = (sizeValue - minSize) / (maxSize - minSize);
      const radius = Math.max(15, Math.min(100, 15 + normalizedSize * 85));

      const priceChange = this.getPriceChangeForTimeframe(coin, timeframe);
      const color = this.getColorForPriceChange(priceChange);

      return {
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        price: coin.current_price,
        marketCap: coin.market_cap,
        volume: coin.total_volume,
        priceChange1h: coin.price_change_percentage_1h_in_currency,
        priceChange24h: coin.price_change_percentage_24h,
        priceChange7d: coin.price_change_percentage_7d_in_currency,
        x: Math.random() * 800, // Will be updated by D3 simulation
        y: Math.random() * 600, // Will be updated by D3 simulation
        radius,
        color,
      };
    });
  }

  private getPriceChangeParams(timeframe: TimeFrame): string {
    switch (timeframe) {
      case '1h':
        return '1h,24h,7d';
      case '24h':
        return '24h,7d';
      case '7d':
        return '7d,24h';
      default:
        return '24h,7d';
    }
  }

  private getPriceChangeForTimeframe(coin: CryptoCoin, timeframe: TimeFrame): number {
    switch (timeframe) {
      case '1h':
        return coin.price_change_percentage_1h_in_currency || 0;
      case '24h':
        return coin.price_change_percentage_24h;
      case '7d':
        return coin.price_change_percentage_7d_in_currency || 0;
      default:
        return coin.price_change_percentage_24h;
    }
  }

  private getColorForPriceChange(priceChange: number): string {
    if (priceChange > 5) return 'hsl(142, 76%, 45%)'; // Strong green
    if (priceChange > 1) return 'hsl(142, 76%, 36%)'; // Green
    if (priceChange > 0) return 'hsl(142, 60%, 30%)'; // Light green
    if (priceChange === 0) return 'hsl(45, 93%, 47%)'; // Neutral yellow
    if (priceChange > -1) return 'hsl(0, 70%, 50%)'; // Light red
    if (priceChange > -5) return 'hsl(0, 84%, 60%)'; // Red
    return 'hsl(0, 90%, 70%)'; // Strong red
  }

  getExternalLinks(coinId: string, symbol: string) {
    return {
      coinGecko: `https://www.coingecko.com/en/coins/${coinId}`,
      coinMarketCap: `https://coinmarketcap.com/currencies/${coinId}`,
      tradingView: `https://www.tradingview.com/symbols/${symbol.toUpperCase()}USD/`,
    };
  }
}

export const cryptoApi = new CryptoApiService();