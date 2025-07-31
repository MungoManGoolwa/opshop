import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, DollarSign, Hash, Info, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Removed apiRequest import - using fetch directly

interface BuybackLimitsSettings {
  id?: number;
  maxItemsPerMonth: number;
  maxPricePerItem: string;
  isActive: boolean;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export default function AdminBuybackLimitsPage() {
  const [settings, setSettings] = useState<BuybackLimitsSettings>({
    maxItemsPerMonth: 2,
    maxPricePerItem: "200.00",
    isActive: true,
    description: "Monthly limits for instant buyback to prevent abuse and maintain system sustainability"
  });
  const [originalSettings, setOriginalSettings] = useState<BuybackLimitsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/buyback-limits-settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
          setOriginalSettings(data);
        }
      } catch (error: any) {
        console.error("Error loading buyback limits settings:", error);
        setError(error.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate input
      const maxItems = parseInt(settings.maxItemsPerMonth.toString());
      const maxPrice = parseFloat(settings.maxPricePerItem);

      if (isNaN(maxItems) || maxItems < 1 || maxItems > 50) {
        setError("Max items per month must be between 1 and 50");
        return;
      }

      if (isNaN(maxPrice) || maxPrice < 10 || maxPrice > 2000) {
        setError("Max price per item must be between $10 and $2000");
        return;
      }

      const response = await fetch('/api/admin/buyback-limits-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxItemsPerMonth: maxItems,
          maxPricePerItem: maxPrice.toFixed(2),
          description: settings.description.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setOriginalSettings(data);
        toast({
          title: "Settings Updated",
          description: "Buyback limits settings have been successfully updated.",
        });
      }
    } catch (error: any) {
      console.error("Error saving buyback limits settings:", error);
      setError(error.message || "Failed to save settings");
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalSettings) {
      setSettings({ ...originalSettings });
      setError(null);
    }
  };

  const hasChanges = originalSettings && (
    settings.maxItemsPerMonth !== originalSettings.maxItemsPerMonth ||
    settings.maxPricePerItem !== originalSettings.maxPricePerItem ||
    settings.description !== originalSettings.description
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading buyback limits settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Buyback Limits Configuration</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure monthly limits for instant buyback offers to prevent abuse and maintain system sustainability.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Current Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Current Limits Overview
            </CardTitle>
            <CardDescription>
              Active limits for all users using the instant buyback system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Hash className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Max Items Per Month</p>
                  <p className="text-2xl font-bold text-blue-600">{settings.maxItemsPerMonth}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Max Price Per Item</p>
                  <p className="text-2xl font-bold text-green-600">${settings.maxPricePerItem}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Configure Limits</CardTitle>
            <CardDescription>
              Adjust the monthly limits and maximum price per item for instant buyback offers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maxItems">Maximum Items Per Month</Label>
                <Input
                  id="maxItems"
                  type="number"
                  min="1"
                  max="50"
                  value={settings.maxItemsPerMonth}
                  onChange={(e) => setSettings({
                    ...settings,
                    maxItemsPerMonth: parseInt(e.target.value) || 1
                  })}
                  disabled={saving}
                />
                <p className="text-sm text-gray-500">
                  Number of items each user can submit for instant buyback per month (1-50)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPrice">Maximum Price Per Item ($)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  min="10"
                  max="2000"
                  step="0.01"
                  value={settings.maxPricePerItem}
                  onChange={(e) => setSettings({
                    ...settings,
                    maxPricePerItem: e.target.value
                  })}
                  disabled={saving}
                />
                <p className="text-sm text-gray-500">
                  Maximum buyback offer amount per item ($10-$2000)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) => setSettings({
                  ...settings,
                  description: e.target.value
                })}
                disabled={saving}
                rows={3}
                placeholder="Description of the buyback limits policy..."
              />
              <p className="text-sm text-gray-500">
                Internal description for admin reference
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSave} 
                disabled={saving || !hasChanges}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset}
                disabled={saving || !hasChanges}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Guidelines Card */}
        <Card>
          <CardHeader>
            <CardTitle>Guidelines & Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p><strong>Monthly Limits:</strong> Set based on business capacity and inventory turnover. Start conservative and adjust based on demand.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p><strong>Price Limits:</strong> Balance user satisfaction with profitability. Consider average item values in your marketplace.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                <p><strong>Abuse Prevention:</strong> These limits help prevent users from exploiting the system with excessive or high-value submissions.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <p><strong>Monitoring:</strong> Regularly review user patterns and adjust limits based on actual usage and business needs.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}