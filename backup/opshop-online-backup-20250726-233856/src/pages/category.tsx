import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductGrid from "@/components/products/product-grid";
import ProductFilters from "@/components/products/product-filters";
import { Skeleton } from "@/components/ui/skeleton";

export default function Category() {
  const { slug } = useParams();
  
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  // Find the current category
  const currentCategory = categories?.find(cat => cat.slug === slug);

  // Filter products by category
  const categoryProducts = products?.filter(product => {
    if (!currentCategory) return false;
    return product.categoryId === currentCategory.id;
  }) || [];

  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
            <p className="text-gray-600">The category you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Category Header */}
      <section className="bg-white py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{currentCategory.name}</h1>
              <p className="text-gray-600 mt-2">
                {categoryProducts.length} {categoryProducts.length === 1 ? 'item' : 'items'} available
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Home › {currentCategory.name}
            </div>
          </div>
        </div>
      </section>

      <ProductFilters />

      {/* Products Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          ) : categoryProducts.length > 0 ? (
            <ProductGrid products={categoryProducts} />
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-gray-600">
                There are currently no items in this category. Check back later!
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}