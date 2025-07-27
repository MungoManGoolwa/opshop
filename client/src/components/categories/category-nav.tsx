import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import LocationSearch from "@/components/location/LocationSearch";
import { useState } from "react";
import type { Suburb } from "@/lib/australianSuburbs";

export default function CategoryNav() {
  const [selectedLocation, setSelectedLocation] = useState<{ suburb: Suburb; radius: number } | null>(null);
  
  const { data: categories, isLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  // TODO: Use selectedLocation to filter products in product listings
  // This will be passed down to product components that need location filtering

  if (isLoading) {
    return (
      <nav className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-6 overflow-x-auto">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-20" />
              ))}
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-6 overflow-x-auto">
            <Link 
              href="/?filter=new-arrivals" 
              className="text-primary font-medium whitespace-nowrap flex items-center space-x-1 hover:text-primary/80"
            >
              <Star className="h-4 w-4 text-accent" />
              <span>New Arrivals</span>
            </Link>
            
            {categories?.slice(1).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="text-gray-600 hover:text-primary whitespace-nowrap transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
          
          <LocationSearch 
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
          />
        </div>
      </div>
    </nav>
  );
}
