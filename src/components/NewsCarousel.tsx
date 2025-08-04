import React, { useState } from 'react';
import { useNewsApi } from '../hooks/useNewsApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Loader2, ExternalLink, Newspaper, RefreshCw, Settings } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { formatDistanceToNow } from 'date-fns';

export const NewsCarousel: React.FC = () => {
  const { articles, loading, error, apiKey, setApiKey, refreshNews } = useNewsApi();
  const { toast } = useToast();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleApiKeySubmit = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim());
      setApiKeyInput('');
      setShowSettings(false);
      toast({
        title: "API Key Saved",
        description: "News API key has been saved and news will be fetched.",
      });
    }
  };

  const handleRefresh = async () => {
    await refreshNews();
    toast({
      title: "News Refreshed",
      description: "Latest crypto news has been fetched.",
    });
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  if (!apiKey) {
    return (
      <div className="w-full mb-6">
        <Card className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 border-purple-500/30">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-white">
              <Newspaper className="w-5 h-5" />
              Crypto News
            </CardTitle>
            <CardDescription className="text-purple-100">
              Enter your News API key to see the latest cryptocurrency news
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex gap-2 w-full max-w-md">
              <Input
                type="password"
                placeholder="Enter News API Key"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                onKeyDown={(e) => e.key === 'Enter' && handleApiKeySubmit()}
              />
              <Button onClick={handleApiKeySubmit} className="bg-purple-600 hover:bg-purple-700">
                Save
              </Button>
            </div>
            <p className="text-sm text-purple-200 text-center">
              Get your free API key from{' '}
              <a 
                href="https://newsapi.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-white underline"
              >
                NewsAPI.org
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Latest Crypto News
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="border-purple-500/30 hover:bg-purple-500/10"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-purple-500/30 hover:bg-purple-500/10">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>News API Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">API Key</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="password"
                      placeholder="Enter new API key"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                    />
                    <Button onClick={handleApiKeySubmit}>Update</Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Card className="mb-4 bg-red-500/20 border-red-500/30">
          <CardContent className="p-4">
            <p className="text-red-200 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading && articles.length === 0 ? (
        <Card className="bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              <span className="text-purple-200">Loading latest crypto news...</span>
            </div>
          </CardContent>
        </Card>
      ) : articles.length > 0 ? (
        <Carousel className="w-full">
          <CarouselContent>
            {articles.map((article, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border-purple-500/30 hover:border-pink-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge 
                        variant="secondary" 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 text-xs"
                      >
                        {article.source.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(article.publishedAt)}
                      </span>
                    </div>
                    <CardTitle className="text-sm line-clamp-2 text-white">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {article.urlToImage && (
                      <div className="mb-3 overflow-hidden rounded-md">
                        <img
                          src={article.urlToImage}
                          alt={article.title}
                          className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <CardDescription className="text-sm line-clamp-3 text-purple-100 mb-3">
                      {article.description || 'No description available.'}
                    </CardDescription>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(article.url, '_blank')}
                      className="w-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-pink-600/30 text-white"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="bg-purple-600/20 border-purple-500/50 hover:bg-purple-600/40 text-white" />
          <CarouselNext className="bg-purple-600/20 border-purple-500/50 hover:bg-purple-600/40 text-white" />
        </Carousel>
      ) : null}
    </div>
  );
};