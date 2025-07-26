import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  DollarSign, 
  Settings, 
  Check,
  X,
  Loader2
} from "lucide-react";

export default function PaymentSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/admin/payment-settings'],
  });

  const [formData, setFormData] = useState({
    stripeEnabled: settings?.stripeEnabled ?? true,
    paypalEnabled: settings?.paypalEnabled ?? true,
    defaultCommissionRate: settings?.defaultCommissionRate ?? "10.00",
    processingFeeRate: settings?.processingFeeRate ?? "2.90",
    currency: settings?.currency ?? "AUD",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/admin/payment-settings", data);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Payment settings have been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update payment settings.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      stripeEnabled: settings?.stripeEnabled ?? true,
      paypalEnabled: settings?.paypalEnabled ?? true,
      defaultCommissionRate: settings?.defaultCommissionRate ?? "10.00",
      processingFeeRate: settings?.processingFeeRate ?? "2.90",
      currency: settings?.currency ?? "AUD",
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Payment Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Payment Settings
          </CardTitle>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              Edit Settings
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                disabled={updateMutation.isPending}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Gateway Status */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Payment Gateways</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">Stripe</p>
                  <p className="text-sm text-gray-600">Credit & Debit Cards</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <Switch
                    checked={formData.stripeEnabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, stripeEnabled: checked })
                    }
                  />
                ) : (
                  <Badge variant={formData.stripeEnabled ? "default" : "secondary"}>
                    {formData.stripeEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PP</span>
                </div>
                <div>
                  <p className="font-medium">PayPal</p>
                  <p className="text-sm text-gray-600">PayPal Payments</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <Switch
                    checked={formData.paypalEnabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, paypalEnabled: checked })
                    }
                  />
                ) : (
                  <Badge variant={formData.paypalEnabled ? "default" : "secondary"}>
                    {formData.paypalEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Commission & Fees */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Commission & Fees</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              {isEditing ? (
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.defaultCommissionRate}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultCommissionRate: e.target.value })
                  }
                />
              ) : (
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">{settings?.defaultCommissionRate}%</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Platform commission</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="processingFee">Processing Fee (%)</Label>
              {isEditing ? (
                <Input
                  id="processingFee"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.processingFeeRate}
                  onChange={(e) =>
                    setFormData({ ...formData, processingFeeRate: e.target.value })
                  }
                />
              ) : (
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">{settings?.processingFeeRate}%</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Payment processing</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              {isEditing ? (
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              ) : (
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{settings?.currency}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Default currency</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Commission Structure</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Sellers keep {100 - parseFloat(formData.defaultCommissionRate)}% of sale price</p>
            <p>• Platform takes {formData.defaultCommissionRate}% commission</p>
            <p>• Payment processing fee: {formData.processingFeeRate}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}