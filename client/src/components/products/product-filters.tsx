import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Grid, List, Filter, X } from "lucide-react";
import { useView } from "@/contexts/ViewContext";
import { categoryFilters, type FilterConfig } from "@/lib/categoryFilters";

interface ProductFiltersProps {
  onFiltersChange?: (filters: any) => void;
}

export default function ProductFilters({ onFiltersChange }: ProductFiltersProps) {
  const { viewMode, setViewMode } = useView();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [filters, setFilters] = useState<any>({
    condition: "",
    sort: "newest",
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (filters.condition) count++;
    if (priceRange[0] > 0 || priceRange[1] < 10000) count++;
    
    // Count category-specific filters
    Object.values(filters).forEach(value => {
      if (value && value !== "" && value !== "newest") {
        if (Array.isArray(value) && value.length > 0) count++;
        else if (!Array.isArray(value)) count++;
      }
    });
    
    setActiveFiltersCount(count);
  }, [selectedCategory, filters, priceRange]);

  // Get category-specific filters - using the first category found for demo
  const categorySpecificFilters = selectedCategory && Object.keys(categoryFilters).length > 0
    ? Object.values(categoryFilters)[0] // Use first available category filters for demo
    : null;

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Reset category-specific filters when category changes
    const resetFilters = { 
      condition: filters.condition,
      sort: filters.sort 
    };
    setFilters(resetFilters);
    applyFilters(resetFilters, categoryId);
  };

  const handlePriceRangeChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
    applyFilters(filters, selectedCategory, newRange);
  };

  const applyFilters = (currentFilters = filters, categoryId = selectedCategory, currentPriceRange = priceRange) => {
    const apiFilters: any = {
      sort: currentFilters.sort || "newest",
    };

    // Basic filters
    if (categoryId) {
      apiFilters.categoryId = parseInt(categoryId);
    }
    if (currentFilters.condition) {
      apiFilters.condition = currentFilters.condition;
    }
    if (currentPriceRange[0] > 0) {
      apiFilters.minPrice = currentPriceRange[0];
    }
    if (currentPriceRange[1] < 10000) {
      apiFilters.maxPrice = currentPriceRange[1];
    }

    // Category-specific filters
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (key !== 'condition' && key !== 'sort' && value) {
        if (Array.isArray(value) && value.length > 0) {
          apiFilters[key] = value;
        } else if (!Array.isArray(value) && value !== "") {
          apiFilters[key] = value;
        }
      }
    });

    onFiltersChange?.(apiFilters);
  };

  const clearAllFilters = () => {
    setSelectedCategory("");
    setFilters({ condition: "", sort: "newest" });
    setPriceRange([0, 10000]);
    onFiltersChange?.({ sort: "newest" });
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        {/* Top Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {Array.isArray(categories) && categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Condition Filter */}
            <Select value={filters.condition} onValueChange={(value) => handleFilterChange("condition", value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Any Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Condition</SelectItem>
                <SelectItem value="excellent">Like New</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Filter */}
            <Select value={filters.sort} onValueChange={(value) => handleFilterChange("sort", value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="views_desc">Most Popular</SelectItem>
                <SelectItem value="title_asc">A-Z</SelectItem>
                <SelectItem value="title_desc">Z-A</SelectItem>
              </SelectContent>
            </Select>

            {/* Advanced Filters Toggle */}
            <Button 
              variant={isExpanded ? "default" : "outline"} 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Advanced Filters
              {activeFiltersCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" onClick={clearAllFilters} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {isExpanded && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Price Range Slider */}
              <div className="space-y-2">
                <Label>Price Range: ${priceRange[0]} - ${priceRange[1] === 10000 ? '10,000+' : priceRange[1]}</Label>
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  max={10000}
                  min={0}
                  step={25}
                  className="w-full"
                />
              </div>

              {/* Category-Specific Filters */}
              {categorySpecificFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorySpecificFilters.map((filterConfig: FilterConfig, index: number) => (
                    <div key={filterConfig.field} className="space-y-2">
                      <Label htmlFor={filterConfig.field}>{filterConfig.label}</Label>
                      
                      {filterConfig.type === 'select' && (
                        <Select 
                          value={filters[filterConfig.field] || ""} 
                          onValueChange={(value) => handleFilterChange(filterConfig.field, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${filterConfig.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any {filterConfig.label}</SelectItem>
                            {filterConfig.options?.map((option, idx) => (
                              <SelectItem key={idx} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {filterConfig.type === 'range' && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Min"
                              value={filters[`min${filterConfig.field.charAt(0).toUpperCase() + filterConfig.field.slice(1)}`] || ""}
                              onChange={(e) => handleFilterChange(`min${filterConfig.field.charAt(0).toUpperCase() + filterConfig.field.slice(1)}`, e.target.value)}
                            />
                            <span>-</span>
                            <Input
                              type="number"
                              placeholder="Max"
                              value={filters[`max${filterConfig.field.charAt(0).toUpperCase() + filterConfig.field.slice(1)}`] || ""}
                              onChange={(e) => handleFilterChange(`max${filterConfig.field.charAt(0).toUpperCase() + filterConfig.field.slice(1)}`, e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {filterConfig.type === 'boolean' && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={filterConfig.field}
                            checked={filters[filterConfig.field] || false}
                            onCheckedChange={(checked) => handleFilterChange(filterConfig.field, checked)}
                          />
                          <Label htmlFor={filterConfig.field}>{filterConfig.label}</Label>
                        </div>
                      )}

                      {filterConfig.type === 'multiselect' && (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {filterConfig.options?.map((option, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${filterConfig.field}-${option.value}`}
                                checked={filters[filterConfig.field]?.includes(option.value) || false}
                                onCheckedChange={(checked) => {
                                  const current = filters[filterConfig.field] || [];
                                  const updated = checked
                                    ? [...current, option.value]
                                    : current.filter((item: string) => item !== option.value);
                                  handleFilterChange(filterConfig.field, updated);
                                }}
                              />
                              <Label htmlFor={`${filterConfig.field}-${option.value}`}>{option.label}</Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
