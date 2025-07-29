import { Link, useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export function Breadcrumbs({ items = [], className, showHome = true }: BreadcrumbsProps) {
  const [location] = useLocation();
  
  // Fetch categories for dynamic breadcrumb generation
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    staleTime: 300000, // Cache for 5 minutes
  });

  // Generate breadcrumbs automatically based on current route
  const generateAutoBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.split('/').filter(segment => segment !== '');
    const breadcrumbs: BreadcrumbItem[] = [];

    if (showHome) {
      breadcrumbs.push({
        label: "Home",
        href: "/",
        isActive: location === "/"
      });
    }

    // Handle different route patterns
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const currentPath = '/' + pathSegments.slice(0, i + 1).join('/');
      const isLast = i === pathSegments.length - 1;

      switch (segment) {
        case 'category': {
          const categorySlug = pathSegments[i + 1];
          if (categorySlug && categories && Array.isArray(categories)) {
            const category = categories.find((cat: any) => cat.slug === categorySlug);
            if (category) {
              breadcrumbs.push({
                label: category.name,
                href: isLast ? undefined : currentPath,
                isActive: isLast
              });
              i++; // Skip the next segment as we've processed it
            }
          }
          break;
        }
        case 'product': {
          breadcrumbs.push({
            label: "Products",
            href: isLast ? undefined : "/",
            isActive: false
          });
          if (pathSegments[i + 1]) {
            breadcrumbs.push({
              label: "Product Details",
              href: undefined,
              isActive: true
            });
            i++; // Skip the product ID
          }
          break;
        }
        case 'search': {
          breadcrumbs.push({
            label: "Search Results",
            href: undefined,
            isActive: true
          });
          break;
        }
        case 'instant-buyback': {
          breadcrumbs.push({
            label: "Instant Buyback",
            href: undefined,
            isActive: true
          });
          break;
        }
        case 'seller': {
          breadcrumbs.push({
            label: "Seller",
            href: isLast ? undefined : "/seller/dashboard",
            isActive: false
          });
          if (pathSegments[i + 1] === 'dashboard') {
            breadcrumbs.push({
              label: "Dashboard",
              href: undefined,
              isActive: true
            });
            i++;
          } else if (pathSegments[i + 1] === 'create') {
            breadcrumbs.push({
              label: "Create Listing",
              href: undefined,
              isActive: true
            });
            i++;
          }
          break;
        }
        case 'admin': {
          breadcrumbs.push({
            label: "Admin",
            href: isLast ? undefined : "/admin/dashboard",
            isActive: false
          });
          const nextSegment = pathSegments[i + 1];
          if (nextSegment) {
            const adminLabels: Record<string, string> = {
              'dashboard': 'Dashboard',
              'users': 'User Management',
              'buyback': 'Buyback Management',
              'site': 'Site Administration'
            };
            breadcrumbs.push({
              label: adminLabels[nextSegment] || nextSegment.charAt(0).toUpperCase() + nextSegment.slice(1),
              href: undefined,
              isActive: true
            });
            i++;
          }
          break;
        }
        case 'profile': {
          breadcrumbs.push({
            label: "Profile",
            href: undefined,
            isActive: true
          });
          break;
        }
        case 'wallet': {
          breadcrumbs.push({
            label: "Wallet",
            href: undefined,
            isActive: true
          });
          break;
        }
        case 'wishlist': {
          breadcrumbs.push({
            label: "Wishlist",
            href: undefined,
            isActive: true
          });
          break;
        }
        case 'cart': {
          breadcrumbs.push({
            label: "Shopping Cart",
            href: undefined,
            isActive: true
          });
          break;
        }
        case 'checkout': {
          breadcrumbs.push({
            label: "Checkout",
            href: undefined,
            isActive: true
          });
          break;
        }
        case 'messages': {
          breadcrumbs.push({
            label: "Messages",
            href: undefined,
            isActive: true
          });
          break;
        }
        case 'about': {
          breadcrumbs.push({
            label: "About",
            href: undefined,
            isActive: true
          });
          break;
        }
        case 'help-center': {
          breadcrumbs.push({
            label: "Help Center",
            href: undefined,
            isActive: true
          });
          break;
        }
        case 'contact': {
          breadcrumbs.push({
            label: "Contact Us",
            href: undefined,
            isActive: true
          });
          break;
        }
        case 'privacy-policy': {
          breadcrumbs.push({
            label: "Privacy Policy",
            href: undefined,
            isActive: true
          });
          break;
        }
        case 'terms-of-service': {
          breadcrumbs.push({
            label: "Terms of Service",
            href: undefined,
            isActive: true
          });
          break;
        }
        case 'safety-guidelines': {
          breadcrumbs.push({
            label: "Safety Guidelines",
            href: undefined,
            isActive: true
          });
          break;
        }
        case 'pricing-guide': {
          breadcrumbs.push({
            label: "Pricing Guide",
            href: undefined,
            isActive: true
          });
          break;
        }
        case 'sell': {
          breadcrumbs.push({
            label: "Sell Items",
            href: undefined,
            isActive: true
          });
          break;
        }
        case 'shop-upgrade': {
          breadcrumbs.push({
            label: "Shop Upgrade",
            href: undefined,
            isActive: true
          });
          break;
        }
        default: {
          // Generic fallback for unknown segments
          const label = segment.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          breadcrumbs.push({
            label,
            href: isLast ? undefined : currentPath,
            isActive: isLast
          });
        }
      }
    }

    return breadcrumbs;
  };

  // Use provided items or generate automatically
  const finalBreadcrumbs = items.length > 0 ? items : generateAutoBreadcrumbs();

  // Don't show breadcrumbs if we're just on the home page
  if (finalBreadcrumbs.length <= 1 && location === "/") {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400", className)}>
      {finalBreadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          )}
          {item.href && !item.isActive ? (
            <Link 
              href={item.href}
              className="hover:text-primary transition-colors duration-200 flex items-center"
            >
              {index === 0 && item.label === "Home" ? (
                <Home className="h-4 w-4" />
              ) : (
                item.label
              )}
            </Link>
          ) : (
            <span 
              className={cn(
                "flex items-center",
                item.isActive 
                  ? "text-gray-900 dark:text-white font-medium" 
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              {index === 0 && item.label === "Home" ? (
                <Home className="h-4 w-4" />
              ) : (
                item.label
              )}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Specialized breadcrumb components for specific use cases
export function ProductBreadcrumbs({ 
  categoryName, 
  categorySlug, 
  productTitle,
  className 
}: { 
  categoryName?: string; 
  categorySlug?: string; 
  productTitle?: string;
  className?: string;
}) {
  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    ...(categoryName && categorySlug ? [{ 
      label: categoryName, 
      href: `/category/${categorySlug}` 
    }] : []),
    ...(productTitle ? [{ 
      label: productTitle, 
      isActive: true 
    }] : [])
  ];

  return <Breadcrumbs items={items} className={className} showHome={true} />;
}

export function CategoryBreadcrumbs({ 
  categoryName, 
  parentCategory,
  className 
}: { 
  categoryName: string; 
  parentCategory?: { name: string; slug: string };
  className?: string;
}) {
  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    ...(parentCategory ? [{ 
      label: parentCategory.name, 
      href: `/category/${parentCategory.slug}` 
    }] : []),
    { label: categoryName, isActive: true }
  ];

  return <Breadcrumbs items={items} className={className} showHome={true} />;
}

export function SearchBreadcrumbs({ 
  query, 
  categoryName,
  className 
}: { 
  query?: string; 
  categoryName?: string;
  className?: string;
}) {
  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    ...(categoryName ? [{ 
      label: categoryName, 
      href: "#" 
    }] : []),
    { 
      label: query ? `Search: "${query}"` : "Search Results", 
      isActive: true 
    }
  ];

  return <Breadcrumbs items={items} className={className} showHome={true} />;
}

export default Breadcrumbs;