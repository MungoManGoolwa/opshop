import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Settings, Percent, TrendingUp, Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface CategoryBuybackSettings {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  buybackPercentage: string;
  buybackSettingsActive: boolean;
}

export default function AdminBuybackSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSettings, setEditingSettings] = useState<{ [key: number]: string }>({});

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['/api/admin/categories/buyback-settings'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async ({ categoryId, buybackPercentage }: { categoryId: number; buybackPercentage: number }) => {
      const response = await fetch(`/api/admin/categories/${categoryId}/buyback-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ buybackPercentage }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update buyback settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories/buyback-settings'] });
      toast({
        title: "Settings Updated",
        description: "Category buyback percentage has been updated successfully.",
      });
      setEditingSettings({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update buyback settings",
        variant: "destructive",
      });
    },
  });

  const handlePercentageChange = (categoryId: number, value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    setEditingSettings(prev => ({
      ...prev,
      [categoryId]: numericValue
    }));
  };

  const handleSaveSettings = (categoryId: number) => {
    const newPercentage = parseFloat(editingSettings[categoryId] || '0');
    
    if (newPercentage < 10 || newPercentage > 80) {
      toast({
        title: "Invalid Percentage",
        description: "Buyback percentage must be between 10% and 80%",
        variant: "destructive",
      });
      return;
    }

    updateSettingsMutation.mutate({ categoryId, buybackPercentage: newPercentage });
  };

  const handleCancelEdit = (categoryId: number) => {
    const { [categoryId]: removed, ...rest } = editingSettings;
    setEditingSettings(rest);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Failed to load category buyback settings. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Category Buyback Settings</h1>
        </div>
        <p className="text-gray-600 max-w-2xl">
          Configure instant buyback percentages for each product category. These percentages determine 
          what portion of the AI-determined market value customers receive as store credit.
        </p>
      </div>

      {/* Category Settings Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(categories as CategoryBuybackSettings[])?.map((category: CategoryBuybackSettings) => {
          const isEditing = category.id in editingSettings;
          const currentPercentage = parseFloat(category.buybackPercentage);
          const editValue = editingSettings[category.id] || currentPercentage.toString();

          return (
            <Card key={category.id} className="relative hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </CardTitle>
                  <Badge 
                    variant={category.buybackSettingsActive ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {category.buybackSettingsActive ? "Active" : "Default"}
                  </Badge>
                </div>
                {category.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Current Percentage Display */}
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Buyback Rate:</span>
                  {!isEditing ? (
                    <span className="text-lg font-bold text-blue-600">
                      {currentPercentage}%
                    </span>
                  ) : null}
                </div>

                {/* Edit Form */}
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`percentage-${category.id}`} className="text-sm font-medium">
                        New Percentage (10% - 80%)
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`percentage-${category.id}`}
                          type="text"
                          value={editValue}
                          onChange={(e) => handlePercentageChange(category.id, e.target.value)}
                          placeholder="40"
                          className="flex-1"
                          min="10"
                          max="80"
                        />
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveSettings(category.id)}
                        disabled={updateSettingsMutation.isPending}
                        className="flex-1"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelEdit(category.id)}
                        disabled={updateSettingsMutation.isPending}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSettings(prev => ({
                      ...prev,
                      [category.id]: currentPercentage.toString()
                    }))}
                    className="w-full"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Edit Percentage
                  </Button>
                )}

                {/* Impact Indicator */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <TrendingUp className="h-3 w-3" />
                    <span>
                      Example: $100 item = ${currentPercentage} buyback
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How Buyback Percentages Work</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• AI evaluates each item's market value</li>
                <li>• Category percentage determines the buyback amount</li>
                <li>• Customers receive store credit instantly</li>
                <li>• Percentage range: 10% - 80% of market value</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}