import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Location {
  id: number;
  postcode: string;
  locality: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
}

interface LocationSelectorProps {
  selectedLocation?: Location | null;
  onLocationSelect: (location: Location | null) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSelector({ 
  selectedLocation, 
  onLocationSelect, 
  placeholder = "Search Australian suburbs and postcodes...",
  className 
}: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Search locations when query changes
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['/api/locations/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const response = await fetch(`/api/locations/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      if (!response.ok) throw new Error('Failed to search locations');
      return response.json();
    },
    enabled: searchQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Show/hide results based on input focus and query
  useEffect(() => {
    setShowResults(isInputFocused && (searchQuery.length >= 2 || searchResults.length > 0));
  }, [isInputFocused, searchQuery, searchResults]);

  const handleLocationSelect = (location: Location) => {
    onLocationSelect(location);
    setSearchQuery("");
    setShowResults(false);
    setIsInputFocused(false);
  };

  const handleClearLocation = () => {
    onLocationSelect(null);
    setSearchQuery("");
    setShowResults(false);
  };

  const formatLocationName = (location: Location) => {
    return `${location.locality}, ${location.state} ${location.postcode}`;
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Input
          type="text"
          placeholder={selectedLocation ? formatLocationName(selectedLocation) : placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => {
            // Delay hiding results to allow for clicks
            setTimeout(() => setIsInputFocused(false), 200);
  }}
          className="pr-20 pl-10"
          autoComplete="off"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        {selectedLocation && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearLocation}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Selected location display */}
      {selectedLocation && !searchQuery && (
        <div className="mt-2">
          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
            <MapPin className="h-3 w-3" />
            {formatLocationName(selectedLocation)}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearLocation}
              className="h-4 w-4 p-0 ml-1 hover:bg-gray-200"
            >
              <X className="h-2 w-2" />
            </Button>
          </Badge>
        </div>
      )}

      {/* Search results dropdown */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-3 text-center text-sm text-gray-500">
                Searching locations...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-3 text-center text-sm text-gray-500">
                {searchQuery.length < 2 ? "Type at least 2 characters to search" : "No locations found"}
              </div>
            ) : (
              <div className="py-1">
                {searchResults.map((location: Location) => (
                  <button
                    key={`${location.postcode}-${location.locality}`}
                    type="button"
                    onClick={() => handleLocationSelect(location)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center gap-2 text-sm"
                  >
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {location.locality}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {location.state} {location.postcode}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LocationSelector;