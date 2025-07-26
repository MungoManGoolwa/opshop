import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Star, MapPin, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryNav() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

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
          
          <button className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:block">Goolwa, SA</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    </nav>
  );
}
