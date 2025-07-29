import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, Clock, TrendingUp, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl?: string;
  brand?: string;
  condition: string;
  views: number;
  category?: string;
}

interface SearchSuggestion {
  query: string;
  type: 'trending' | 'brand' | 'category' | 'recent';
  count?: number;
}

interface LiveSearchProps {
  placeholder?: string;
  onSearchChange?: (query: string) => void;
  onResultSelect?: (productId: string) => void;
  className?: string;
}

export default function LiveSearch({ 
  placeholder = "Search for products...", 
  onSearchChange,
  onResultSelect,
  className 
}: LiveSearchProps) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Search products with debounced query
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["/api/products/search", query],
    queryFn: async () => {
      if (!query.trim() || query.length < 2) return [];
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=6`);
      return response.json();
    },
    enabled: query.length >= 2,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Get search suggestions
  const { data: suggestions } = useQuery({
    queryKey: ["/api/search/suggestions"],
    staleTime: 300000, // Cache for 5 minutes
  });

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    onSearchChange?.(value);
    setShowResults(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearchChange?.(suggestion);
    addToRecentSearches(suggestion);
    setShowResults(false);
    
    // Navigate to search page with query
    window.location.href = `/search?q=${encodeURIComponent(suggestion)}`;
  };

  const handleResultClick = (product: SearchResult) => {
    addToRecentSearches(query);
    setShowResults(false);
    onResultSelect?.(product.id);
  };

  const addToRecentSearches = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearQuery = () => {
    setQuery("");
    onSearchChange?.("");
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addToRecentSearches(query);
      setShowResults(false);
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'trending':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'brand':
        return <Tag className="h-4 w-4 text-blue-500" />;
      case 'category':
        return <Tag className="h-4 w-4 text-green-500" />;
      case 'recent':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowResults(true)}
          className={cn(
            "pl-12 pr-12",
            className
          )}
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        {query && (
          <button
            type="button"
            onClick={clearQuery}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Search Results */}
          {query.length >= 2 && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                  Search Results
                </h4>
                {searchLoading && (
                  <div className="animate-spin w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full" />
                )}
              </div>
              
              {searchLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-2">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchResults?.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((product: SearchResult) => (
                    <button
                      key={product.id}
                      onClick={() => handleResultClick(product)}
                      className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-left"
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                          <Search className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {product.title}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>${product.price}</span>
                          <span>•</span>
                          <span className="capitalize">{product.condition}</span>
                          {product.brand && (
                            <>
                              <span>•</span>
                              <span>{product.brand}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {searchResults.length === 6 && (
                    <button
                      onClick={() => window.location.href = `/search?q=${encodeURIComponent(query)}`}
                      className="w-full p-2 text-center text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      View all results →
                    </button>
                  )}
                </div>
              ) : query.length >= 2 && (
                <div className="text-center py-4 text-gray-500">
                  No products found for "{query}"
                </div>
              )}
            </div>
          )}

          {/* Suggestions */}
          {(!query || query.length < 2) && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Recent Searches
                  </h4>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(search)}
                        className="w-full flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-left"
                      >
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Suggestions */}
              {suggestions && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Popular Searches
                  </h4>
                  <div className="space-y-1">
                    {suggestions.slice(0, 6).map((suggestion: SearchSuggestion, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion.query)}
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-left"
                      >
                        <div className="flex items-center space-x-2">
                          {getSuggestionIcon(suggestion.type)}
                          <span className="text-gray-700 dark:text-gray-300">{suggestion.query}</span>
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.type}
                          </Badge>
                        </div>
                        {suggestion.count && (
                          <span className="text-xs text-gray-500">{suggestion.count}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}