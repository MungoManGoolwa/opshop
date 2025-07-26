import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Home, Search, Plus, Heart, User } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { icon: Home, label: "Home", href: "/", active: location === "/" },
    { icon: Search, label: "Search", href: "/search", active: location === "/search" },
    { icon: Plus, label: "Sell", href: "/sell", active: location === "/sell" },
    { icon: Heart, label: "Saved", href: "/wishlist", active: location === "/wishlist" },
    { icon: User, label: "Profile", href: "/profile", active: location === "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = item.active;
          
          if (item.href === "/sell" || item.href === "/wishlist" || item.href === "/profile") {
            if (!isAuthenticated) {
              return (
                <button
                  key={item.label}
                  onClick={() => window.location.href = "/api/login"}
                  className={`flex flex-col items-center p-2 ${
                    isActive ? "text-primary" : "text-gray-600"
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              );
            }
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center p-2 ${
                isActive ? "text-primary" : "text-gray-600"
              }`}
            >
              <IconComponent className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
