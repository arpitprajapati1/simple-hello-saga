import axios from 'axios';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export class NewsApiService {
  private static API_KEY_STORAGE_KEY = 'news_api_key';
  private static BASE_URL = 'https://newsapi.org/v2';

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async getCryptoNews(): Promise<{ success: boolean; data?: NewsArticle[]; error?: string }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'News API key not found. Please set your API key.' };
    }

    try {
      const response = await axios.get<NewsResponse>(`${this.BASE_URL}/everything`, {
        params: {
          q: 'cryptocurrency OR bitcoin OR ethereum OR crypto OR blockchain',
          sortBy: 'publishedAt',
          pageSize: 10,
          language: 'en',
          apiKey: apiKey,
        },
      });

      if (response.data.status === 'ok') {
        return { success: true, data: response.data.articles };
      } else {
        return { success: false, error: 'Failed to fetch news' };
      }
    } catch (error) {
      console.error('Error fetching crypto news:', error);
      return { 
        success: false, 
        error: axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'Failed to fetch news' 
      };
    }
  }
}