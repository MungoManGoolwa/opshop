import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AustralianLocation {
  id: number;
  postcode: string;
  locality: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
}

interface LocationSearchProps {
  selectedLocation?: { suburb: { name: string; postcode: string; state: string; lat: number; lng: number }; radius: number } | null;
  onLocationChange: (location: { suburb: { name: string; postcode: string; state: string; lat: number; lng: number }; radius: number } | null) => void;
  className?: string;
  placeholder?: string;
  showRadiusSelector?: boolean;
}

const RADIUS_OPTIONS = [
  { value: 5, label: "5km" },
  { value: 10, label: "10km" },
  { value: 25, label: "25km" },
  { value: 50, label: "50km" },
  { value: 100, label: "100km" },
  { value: 250, label: "250km" },
];

export default function LocationSearch({
  selectedLocation,
  onLocationChange,
  className,
  placeholder = "Search Australian suburbs and postcodes...",
  showRadiusSelector = true,
}: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(selectedLocation?.radius || 25);

  // Search Australian locations
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

  // Get popular locations for initial display
  const { data: popularLocations = [] } = useQuery({
    queryKey: ['/api/locations/popular'],
    queryFn: async () => {
      // Get major cities from different states
      const cities = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Darwin', 'Hobart', 'Canberra'];
      const results = [];
      
      for (const city of cities) {
        try {
          const response = await fetch(`/api/locations/search?q=${encodeURIComponent(city)}&limit=1`);
          if (response.ok) {
            const locations = await response.json();
            if (locations.length > 0) {
              results.push(locations[0]);
            }
          }
        } catch (error) {
          console.error(`Failed to fetch ${city}:`, error);
        }
      }
      return results;
    },
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });

  // Show/hide dropdown based on input focus and query
  useEffect(() => {
    setShowDropdown(isInputFocused && (searchQuery.length >= 2 || (searchQuery.length === 0 && popularLocations.length > 0)));
  }, [isInputFocused, searchQuery, popularLocations]);

  // Sync selected radius when selectedLocation changes
  useEffect(() => {
    if (selectedLocation?.radius && selectedLocation.radius !== selectedRadius) {
      setSelectedRadius(selectedLocation.radius);
    }
  }, [selectedLocation, selectedRadius]);

  const handleLocationSelect = (location: AustralianLocation) => {
    const lat = location.latitude || 0;
    const lng = location.longitude || 0;
    
    const suburb = {
      name: location.locality,
      postcode: location.postcode,
      state: location.state,
      lat,
      lng,
    };
    
    onLocationChange({ suburb, radius: selectedRadius });
    setSearchQuery("");
    setShowDropdown(false);
    setIsInputFocused(false);
  };

  const handleClearLocation = () => {
    onLocationChange(null);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleRadiusChange = (radius: number) => {
    setSelectedRadius(radius);
    if (selectedLocation) {
      onLocationChange({ suburb: selectedLocation.suburb, radius });
    }
  };

  const formatLocationName = (location: { suburb: { name: string; state: string; postcode: string } }) => {
    return `${location.suburb.name}, ${location.suburb.state} ${location.suburb.postcode}`;
  };

  const displayLocations = searchQuery.length >= 2 ? searchResults : popularLocations;

  return (
    <div className={cn("relative", className)}>
      <div className="space-y-3">
        {/* Location Search */}
        <div className="relative">
          <Input
            type="text"
            placeholder={selectedLocation ? formatLocationName(selectedLocation) : placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => {
              // Delay hiding dropdown to allow for clicks
              setTimeout(() => setIsInputFocused(false), 200);
            }}
            className="pl-10 pr-10"
            autoComplete="off"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          
          {selectedLocation && !searchQuery && (
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

        {/* Radius Selector */}
        {showRadiusSelector && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Search Radius</label>
            <div className="flex flex-wrap gap-2">
              {RADIUS_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={selectedRadius === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRadiusChange(option.value)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Selected location display */}
        {selectedLocation && !searchQuery && (
          <div>
            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
              <MapPin className="h-3 w-3" />
              {formatLocationName(selectedLocation)}
              {showRadiusSelector && ` • ${selectedRadius}km radius`}
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
      </div>

      {/* Search results dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-center text-sm text-gray-500">
              Searching locations...
            </div>
          ) : displayLocations.length === 0 ? (
            <div className="p-3 text-center text-sm text-gray-500">
              {searchQuery.length < 2 ? "Type at least 2 characters to search" : "No locations found"}
            </div>
          ) : (
            <>
              {searchQuery.length === 0 && popularLocations.length > 0 && (
                <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                  Popular Cities
                </div>
              )}
              {displayLocations.map((location: AustralianLocation) => (
                <button
                  key={`${location.postcode}-${location.locality}`}
                  type="button"
                  onClick={() => handleLocationSelect(location)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center space-x-2 text-sm"
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
            </>
          )}
        </div>
      )}
    </div>
  );
}