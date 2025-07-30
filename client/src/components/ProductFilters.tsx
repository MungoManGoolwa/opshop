import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FilterX, ChevronDown, ChevronUp } from 'lucide-react';
import { getFiltersForCategory, sortOptions, FilterConfig, buildFilterQuery, parseFilterQuery } from '@/lib/categoryFilters';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ProductFiltersProps {
  categorySlug?: string;
  onFiltersChange: (filters: Record<string, any>) => void;
  initialFilters?: Record<string, any>;
}

export default function ProductFilters({ categorySlug, onFiltersChange, initialFilters = {} }: ProductFiltersProps) {
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['general', 'price', 'sort']));
  const [availableFilters, setAvailableFilters] = useState<FilterConfig[]>([]);

  useEffect(() => {
    if (categorySlug) {
      const categoryFilters = getFiltersForCategory(categorySlug);
      setAvailableFilters(categoryFilters);
    } else {
      setAvailableFilters(getFiltersForCategory(''));
    }
  }, [categorySlug]);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const removeFilter = (key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getActiveFiltersCount = () => {
    return Object.keys(filters).filter(key => 
      filters[key] !== undefined && 
      filters[key] !== null && 
      filters[key] !== '' &&
      !(Array.isArray(filters[key]) && filters[key].length === 0)
    ).length;
  };

  const renderFilter = (filter: FilterConfig) => {
    const value = filters[filter.field];

    switch (filter.type) {
      case 'select':
        return (
          <div key={filter.field} className="space-y-2">
            <Label htmlFor={filter.field}>{filter.label}</Label>
            <Select
              value={value || ''}
              onValueChange={(newValue) => updateFilter(filter.field, newValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter.label.toLowerCase()}</SelectItem>
                {filter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'range':
        const rangeValue = value || [filter.min || 0, filter.max || 100];
        return (
          <div key={filter.field} className="space-y-3">
            <Label>{filter.label}</Label>
            <div className="px-3">
              <Slider
                value={rangeValue}
                onValueChange={(newValue) => updateFilter(filter.field, newValue)}
                min={filter.min || 0}
                max={filter.max || 100}
                step={filter.step || 1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>{filter.unit}{rangeValue[0]}</span>
                <span>{filter.unit}{rangeValue[1]}</span>
              </div>
            </div>
          </div>
        );

      case 'multiselect':
        const multiValue = value || [];
        return (
          <div key={filter.field} className="space-y-2">
            <Label>{filter.label}</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filter.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${filter.field}-${option.value}`}
                    checked={multiValue.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilter(filter.field, [...multiValue, option.value]);
                      } else {
                        updateFilter(filter.field, multiValue.filter((v: string) => v !== option.value));
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`${filter.field}-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'boolean':
        return (
          <div key={filter.field} className="flex items-center space-x-2">
            <Checkbox
              id={filter.field}
              checked={value || false}
              onCheckedChange={(checked) => updateFilter(filter.field, checked)}
            />
            <Label htmlFor={filter.field} className="cursor-pointer">
              {filter.label}
            </Label>
          </div>
        );

      default:
        return null;
    }
  };

  const groupFilters = () => {
    const groups: Record<string, FilterConfig[]> = {
      general: [],
      category: []
    };

    availableFilters.forEach(filter => {
      if (['price', 'condition', 'brand', 'color'].includes(filter.field)) {
        groups.general.push(filter);
      } else {
        groups.category.push(filter);
      }
    });

    return groups;
  };

  const filterGroups = groupFilters();
  const activeCount = getActiveFiltersCount();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            Filters
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeCount}
              </Badge>
            )}
          </CardTitle>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <FilterX className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sort */}
        <Collapsible 
          open={openSections.has('sort')} 
          onOpenChange={() => toggleSection('sort')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md">
            <span className="font-medium">Sort By</span>
            {openSections.has('sort') ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <Select
              value={filters.sort || 'newest'}
              onValueChange={(value) => updateFilter('sort', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CollapsibleContent>
        </Collapsible>

        {/* General Filters */}
        {filterGroups.general.length > 0 && (
          <Collapsible 
            open={openSections.has('general')} 
            onOpenChange={() => toggleSection('general')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md">
              <span className="font-medium">General</span>
              {openSections.has('general') ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-4">
              {filterGroups.general.map(renderFilter)}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Category-Specific Filters */}
        {filterGroups.category.length > 0 && (
          <Collapsible 
            open={openSections.has('category')} 
            onOpenChange={() => toggleSection('category')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md">
              <span className="font-medium">
                {categorySlug ? categorySlug.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ') : 'Category'} Specific
              </span>
              {openSections.has('category') ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-4">
              {filterGroups.category.map(renderFilter)}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Active Filters Summary */}
        {activeCount > 0 && (
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || value === '' || (Array.isArray(value) && value.length === 0)) {
                  return null;
                }

                const filter = availableFilters.find(f => f.field === key);
                if (!filter) return null;

                let displayValue = value;
                if (Array.isArray(value)) {
                  displayValue = value.join(', ');
                } else if (filter.type === 'range') {
                  displayValue = `${filter.unit || ''}${value[0]} - ${filter.unit || ''}${value[1]}`;
                } else if (filter.type === 'boolean') {
                  displayValue = value ? 'Yes' : 'No';
                }

                return (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeFilter(key)}
                  >
                    {filter.label}: {displayValue}
                    <FilterX className="h-3 w-3 ml-1" />
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}