import { useState, useRef, useEffect } from "react";
import { MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { searchSuburbs, type Suburb } from "@/lib/australianSuburbs";

interface LocationSearchProps {
  selectedLocation?: { suburb: Suburb; radius: number } | null;
  onLocationChange: (location: { suburb: Suburb; radius: number } | null) => void;
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

export default function LocationSearch({ 
  selectedLocation, 
  onLocationChange, 
  className = "" 
}: LocationSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Suburb[]>([]);
  const [selectedRadius, setSelectedRadius] = useState(selectedLocation?.radius || 25); // Use existing radius or default 25km
  const searchRef = useRef<HTMLDivElement>(null);

  // Search suburbs when query changes
  useEffect(() => {
    const results = searchSuburbs(searchQuery);
    setSearchResults(results);
  }, [searchQuery]);

  // Sync selected radius when selectedLocation changes
  useEffect(() => {
    if (selectedLocation?.radius && selectedLocation.radius !== selectedRadius) {
      setSelectedRadius(selectedLocation.radius);
    }
  }, [selectedLocation, selectedRadius]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuburbSelect = (suburb: Suburb) => {
    onLocationChange({ suburb, radius: selectedRadius });
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleRadiusChange = (radius: string) => {
    const radiusNum = parseInt(radius);
    console.log(`Radius changing from ${selectedRadius} to ${radiusNum}`);
    setSelectedRadius(radiusNum);
    // Always call onLocationChange when radius changes, even without a suburb
    if (selectedLocation) {
      console.log(`Updating location with new radius: ${radiusNum}km`);
      onLocationChange({ suburb: selectedLocation.suburb, radius: radiusNum });
    }
  };

  const clearLocation = () => {
    onLocationChange(null);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Current Selection Display */}
      {!isOpen && selectedLocation ? (
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1 px-3 py-1">
            <MapPin className="h-3 w-3" />
            <span>{selectedLocation.suburb.name}, {selectedLocation.suburb.state}</span>
            <span className="text-xs">({selectedLocation.radius}km)</span>
            <button 
              onClick={clearLocation}
              className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="text-xs"
          >
            Change
          </Button>
        </div>
      ) : !isOpen ? (
        /* Default Button */
        <Button
          variant="ghost"
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors"
        >
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:block">
            {selectedLocation ? `${selectedLocation.suburb.name}, ${selectedLocation.suburb.state}` : "All Locations"}
          </span>
          <Search className="h-3 w-3" />
        </Button>
      ) : (
        /* Search Interface */
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[350px] z-50">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search suburbs, cities, postcodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            {/* Radius Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Within:</span>
              <Select value={selectedRadius.toString()} onValueChange={handleRadiusChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RADIUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Results */}
            <div className="max-h-60 overflow-y-auto">
              <div className="space-y-1">
                {/* All locations option always shown first */}
                <button
                  onClick={clearLocation}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors border-b border-gray-100"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">All locations</div>
                      <div className="text-sm text-gray-500">
                        View products from all areas
                      </div>
                    </div>
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                </button>
                
                {searchResults.length > 0 && searchResults.map((suburb, index) => (
                  <button
                    key={`${suburb.name}-${suburb.state}-${index}`}
                    onClick={() => handleSuburbSelect(suburb)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{suburb.name}</div>
                        <div className="text-sm text-gray-500">
                          {suburb.state} {suburb.postcode}
                        </div>
                      </div>
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
              
              {searchQuery && searchResults.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No suburbs found for "{searchQuery}"
                </div>
              )}
              
              {!searchQuery && searchResults.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Start typing to search suburbs
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-2 border-t">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  setSearchQuery("");
                }}
              >
                Cancel
              </Button>
              {selectedLocation && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearLocation}
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}