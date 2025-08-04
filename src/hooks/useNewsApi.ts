import { useState, useEffect } from 'react';
import { NewsApiService, NewsArticle } from '../services/newsApi';

interface UseNewsApiResult {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  apiKey: string | null;
  setApiKey: (apiKey: string) => void;
  refreshNews: () => Promise<void>;
}

export const useNewsApi = (): UseNewsApiResult => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKeyState] = useState<string | null>(NewsApiService.getApiKey());

  const setApiKey = (newApiKey: string) => {
    NewsApiService.saveApiKey(newApiKey);
    setApiKeyState(newApiKey);
    setError(null);
  };

  const refreshNews = async () => {
    if (!apiKey) {
      setError('Please set your News API key first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await NewsApiService.getCryptoNews();
      
      if (result.success && result.data) {
        setArticles(result.data);
      } else {
        setError(result.error || 'Failed to fetch news');
        setArticles([]);
      }
    } catch (err) {
      setError('Failed to fetch news');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiKey) {
      refreshNews();
    }
  }, [apiKey]);

  return {
    articles,
    loading,
    error,
    apiKey,
    setApiKey,
    refreshNews,
  };
};