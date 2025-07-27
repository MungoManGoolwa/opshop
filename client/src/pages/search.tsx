import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import CategoryNav from "@/components/categories/category-nav";
import ProductGrid from "@/components/products/product-grid";
import ProductFilters from "@/components/products/product-filters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, X } from "lucide-react";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  useEffect(() => {
    document.title = "Search - Opshop Online";
    
    // Get search query from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
      setSearchQuery(query);
      setSubmittedQuery(query);
    }
  }, []);

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products", { search: submittedQuery }],
    enabled: !!submittedQuery,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSubmittedQuery(searchQuery.trim());
      // Update URL
      const url = new URL(window.location.href);
      url.searchParams.set('q', searchQuery.trim());
      window.history.pushState({}, '', url.toString());
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSubmittedQuery("");
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen bg-neutral">
      <Header />
      <CategoryNav />

      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">Search Marketplace</h1>
            
            <form onSubmit={handleSearch} className="relative mb-8">
              <Input
                type="text"
                placeholder="Search for items, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 py-3 text-lg"
              />
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </form>

            <div className="flex justify-center">
              <Button 
                type="submit" 
                onClick={handleSearch}
                className="px-8"
              >
                <SearchIcon className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ProductFilters />

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {submittedQuery && (
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Search results for "{submittedQuery}"
                </h2>
                <span className="text-gray-600">
                  {Array.isArray(products) ? products.length : 0} items found
                </span>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : submittedQuery && Array.isArray(products) && products.length > 0 ? (
            <ProductGrid products={products} />
          ) : submittedQuery ? (
            <div className="text-center py-12">
              <SearchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No results found for "{submittedQuery}"</p>
              <p className="text-gray-500">Try different keywords or browse our categories</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <SearchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">Start searching for amazing finds</p>
              <p className="text-gray-500">Enter keywords above to discover pre-loved treasures</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  );
}