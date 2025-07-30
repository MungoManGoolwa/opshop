import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import ProductGrid from "@/components/products/product-grid";
import ProductFilters from "@/components/products/product-filters";
import LiveSearch from "@/components/search/live-search";
import { SearchBreadcrumbs } from "@/components/navigation/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Filter, X, SortAsc, SortDesc } from "lucide-react";
import type { Suburb } from "@/lib/australianSuburbs";
import SEOHead from "@/components/SEOHead";

interface ProductFilterState {
  categoryId?: number;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  search?: string;
  sort?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  brand?: string;
  color?: string;
  size?: string;
  material?: string;
  [key: string]: any;
}

export default function SearchPage() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ProductFilterState>({});
  const [selectedLocation, setSelectedLocation] = useState<{ suburb: Suburb; radius: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");

  const searchTerms = searchQuery || "all items";

  useEffect(() => {
    // Extract search query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
      setSearchQuery(query);
      setFilters(prev => ({ ...prev, search: query }));
    }
    
    document.title = query ? `Search: ${query} - Opshop Online` : "Search - Opshop Online";
  }, [location]);

  // Build query parameters for products API
  const queryParams = new URLSearchParams();
  if (filters.categoryId) queryParams.append('categoryId', filters.categoryId.toString());
  if (filters.condition && filters.condition !== 'any') queryParams.append('condition', filters.condition);
  if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
  if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());
  if (sortBy !== 'relevance') queryParams.append('sort', sortBy);

  // Add location-based filtering
  if (selectedLocation) {
    queryParams.append('latitude', selectedLocation.suburb.latitude.toString());
    queryParams.append('longitude', selectedLocation.suburb.longitude.toString());
    queryParams.append('radius', selectedLocation.radius.toString());
  }

  // Add advanced filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value && key !== 'search' && key !== 'categoryId' && key !== 'condition' && key !== 'minPrice' && key !== 'maxPrice') {
      queryParams.append(key, value.toString());
    }
  });

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["/api/products", queryParams.toString()],
    enabled: true,
  });

  const handleFilterChange = (newFilters: ProductFilterState) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleLocationChange = (location: { suburb: Suburb; radius: number } | null) => {
    setSelectedLocation(location);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, search: query }));
    
    // Update URL without page reload
    const url = new URL(window.location.href);
    if (query.trim()) {
      url.searchParams.set('q', query.trim());
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url.toString());
  };

  const clearFilters = () => {
    setFilters({ search: searchQuery });
    setSelectedLocation(null);
    setSortBy("relevance");
  };

  const activeFilterCount = Object.keys(filters).filter(key => 
    key !== 'search' && filters[key] !== undefined && filters[key] !== '' && filters[key] !== 'any'
  ).length + (selectedLocation ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <SEOHead
        title={`Search Results for "${searchTerms}" - Second-Hand Marketplace | Opshop Online`}
        description={`Find quality second-hand ${searchTerms} across Australia. Browse pre-loved items with sustainable shopping on Opshop Online's marketplace. Filter by location, condition, and price.`}
        keywords={`search ${searchTerms}, second hand ${searchTerms}, pre-loved items, sustainable shopping, Australia marketplace`}
        url={`/search?q=${encodeURIComponent(searchQuery)}`}
      />
      <Header />
      <MobileNav />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <SearchBreadcrumbs 
            query={searchQuery}
            categoryName={filters.categoryId ? "Category" : undefined}
          />
        </div>

        {/* Search Header */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto mb-6">
            <LiveSearch
              placeholder="Search for products, brands, or categories..."
              onSearchChange={handleSearchChange}
              onResultSelect={(productId) => {
                window.location.href = `/product/${productId}`;
              }}
              className="h-12 text-base"
            />
          </div>

          {searchQuery && (
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Search Results for "{searchQuery}"
              </h1>
              {Array.isArray(products) && (
                <p className="text-gray-600 dark:text-gray-400">
                  {products.length} {products.length === 1 ? 'product' : 'products'} found
                </p>
              )}
            </div>
          )}

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          {showFilters && (
            <aside className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Refine Results</h3>
                <ProductFilters
                  filters={filters}
                  onFiltersChange={handleFilterChange}
                  selectedLocation={selectedLocation}
                  onLocationChange={handleLocationChange}
                />
              </div>
            </aside>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <SearchIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Search Error
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Something went wrong while searching. Please try again.
                </p>
              </div>
            ) : !Array.isArray(products) || products.length === 0 ? (
              <div className="text-center py-12">
                <SearchIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchQuery 
                    ? `We couldn't find any products matching "${searchQuery}"`
                    : "Try adjusting your search or filters to find what you're looking for"
                  }
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mx-auto"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <ProductGrid products={products} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}