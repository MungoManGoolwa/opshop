import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AustralianLocation {
  id: number;
  postcode: string;
  locality: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
}

interface CompactLocationSearchProps {
  selectedLocation?: { suburb: { name: string; postcode: string; state: string; latitude: number; longitude: number }; radius: number } | null;
  onLocationChange: (location: { suburb: { name: string; postcode: string; state: string; latitude: number; longitude: number }; radius: number } | null) => void;
  className?: string;
}

const RADIUS_OPTIONS = [
  { value: 5, label: "5km" },
  { value: 10, label: "10km" },
  { value: 25, label: "25km" },
  { value: 50, label: "50km" },
  { value: 100, label: "100km" },
  { value: 250, label: "250km" },
];

export default function CompactLocationSearch({
  selectedLocation,
  onLocationChange,
  className,
}: CompactLocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRadiusSelector, setShowRadiusSelector] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(selectedLocation?.radius || 25);

  // Search Australian locations
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['/api/locations/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const response = await fetch(`/api/locations/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
      if (!response.ok) throw new Error('Failed to search locations');
      return response.json();
    },
    enabled: searchQuery.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  // Get popular locations
  const { data: popularLocations = [] } = useQuery({
    queryKey: ['/api/locations/popular'],
    queryFn: async () => {
      const cities = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra'];
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
    staleTime: 60 * 60 * 1000,
  });

  const handleLocationSelect = (location: AustralianLocation) => {
    const suburb = {
      name: location.locality,
      postcode: location.postcode,
      state: location.state,
      latitude: location.latitude || 0,
      longitude: location.longitude || 0,
    };
    
    onLocationChange({ suburb, radius: selectedRadius });
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleRadiusChange = (radius: number) => {
    setSelectedRadius(radius);
    if (selectedLocation) {
      onLocationChange({
        suburb: selectedLocation.suburb,
        radius
      });
    }
    setShowRadiusSelector(false);
  };

  const clearLocation = () => {
    onLocationChange(null);
    setSearchQuery("");
    setShowDropdown(false);
    setShowRadiusSelector(false);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Compact location input */}
      <div className="flex items-center space-x-1">
        {/* Main search input */}
        <div className="relative">
          <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <Input
            type="text"
            placeholder={selectedLocation ? 
              `${selectedLocation.suburb.name}, ${selectedLocation.suburb.state}` : 
              "Location..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            className={cn(
              "pl-7 pr-6 h-8 text-xs border-gray-300",
              "w-32 sm:w-40 md:w-48",
              selectedLocation && !searchQuery ? "text-green-700 bg-green-50 border-green-300" : ""
            )}
          />
          {(selectedLocation || searchQuery) && (
            <button
              onClick={clearLocation}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Radius selector button */}
        {selectedLocation && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRadiusSelector(!showRadiusSelector)}
            className="h-8 px-2 text-xs border-gray-300 bg-white hover:bg-gray-50"
          >
            {selectedRadius}km
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>

      {/* Location search dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
          {isLoading && searchQuery.length >= 2 ? (
            <div className="p-2 text-xs text-gray-500 text-center">Searching...</div>
          ) : searchQuery.length >= 2 && searchResults.length > 0 ? (
            searchResults.map((location: AustralianLocation) => (
              <button
                key={`${location.postcode}-${location.locality}`}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center space-x-2 text-xs"
                onClick={() => handleLocationSelect(location)}
              >
                <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                <span className="truncate">
                  {location.locality}, {location.state} {location.postcode}
                </span>
              </button>
            ))
          ) : searchQuery.length >= 2 && !isLoading ? (
            <div className="p-3 text-xs text-gray-500 text-center">No locations found</div>
          ) : popularLocations.length > 0 ? (
            <>
              <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">Popular Cities</div>
              {popularLocations.map((location: AustralianLocation) => (
                <button
                  key={`popular-${location.postcode}-${location.locality}`}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center space-x-2 text-xs"
                  onClick={() => handleLocationSelect(location)}
                >
                  <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">
                    {location.locality}, {location.state}
                  </span>
                </button>
              ))}
            </>
          ) : null}
        </div>
      )}

      {/* Radius selector dropdown */}
      {showRadiusSelector && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2">
          <div className="text-xs font-medium text-gray-600 mb-1">Search radius:</div>
          <div className="grid grid-cols-3 gap-1">
            {RADIUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleRadiusChange(option.value)}
                className={cn(
                  "px-2 py-1 text-xs rounded border transition-colors",
                  selectedRadius === option.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}