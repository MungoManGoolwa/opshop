import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import CategoryNav from "@/components/categories/category-nav";
import ProductGrid from "@/components/products/product-grid";
import ProductFilters from "@/components/products/product-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import type { Suburb } from "@/lib/australianSuburbs";

interface ProductFilterState {
  categoryId?: number;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  search?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [filters, setFilters] = useState<ProductFilterState>({});
  const [selectedLocation, setSelectedLocation] = useState<{ suburb: Suburb; radius: number } | null>(null);

  useEffect(() => {
    document.title = "Home - Opshop Online";
    
    // Get search query and filter from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const filterParam = urlParams.get('filter');
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    if (filterParam) {
      setFilterMode(filterParam);
    }
  }, []);

  // Build query parameters for products API
  const queryParams = new URLSearchParams();
  if (filters.categoryId) queryParams.append('categoryId', filters.categoryId.toString());
  if (filters.condition && filters.condition !== 'any') queryParams.append('condition', filters.condition);
  if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
  if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());
  
  // Add location-based filtering
  if (selectedLocation) {
    queryParams.append('latitude', selectedLocation.suburb.latitude.toString());
    queryParams.append('longitude', selectedLocation.suburb.longitude.toString());
    queryParams.append('radius', selectedLocation.radius.toString());
  }

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products", queryParams.toString()],
    queryFn: async () => {
      const url = `/api/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  // Filter products based on search query and filter mode
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) {
      return products;
    }

    let filtered = products;

    // Apply filter mode first
    if (filterMode === 'new-arrivals') {
      // Sort by creation date, newest first
      filtered = [...products].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    // Then apply search query if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.title?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.color?.toLowerCase().includes(query) ||
        product.material?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, searchQuery, filterMode]);

  const clearSearch = () => {
    setSearchQuery("");
    setFilterMode("");
    // Remove search and filter params from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('search');
    url.searchParams.delete('filter');
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen bg-neutral">
      <Header />
      <CategoryNav 
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
      />
      <ProductFilters onFiltersChange={setFilters} />

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Search Results Header */}
          {searchQuery && (
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Search results for "{searchQuery}"
                </h2>
                <button
                  onClick={clearSearch}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear search
                </button>
              </div>
              <div className="relative mt-4">
                <Input
                  type="text"
                  placeholder="Refine your search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              {searchQuery ? 'Search Results' : 
               filterMode === 'new-arrivals' ? 'New Arrivals' : 
               'Recent Listings'}
            </h2>
            <span className="text-gray-600">
              {Array.isArray(filteredProducts) ? filteredProducts.length : 0} items found
            </span>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                  <Skeleton className="w-full h-48 mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              ))}
            </div>
          ) : Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : searchQuery ? (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No results found for "{searchQuery}"</p>
              <p className="text-gray-500">Try different keywords or check your spelling</p>
              <button
                onClick={clearSearch}
                className="mt-4 text-primary hover:underline"
              >
                Clear search and browse all items
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products found.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  );
}
