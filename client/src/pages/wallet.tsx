import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Wallet as WalletIcon,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Award,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Eye,
  Download,
  RefreshCw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface StoreCreditTransaction {
  id: number;
  type: "earned" | "spent" | "refund" | "buyback";
  amount: string;
  description: string;
  referenceId: string;
  referenceType: string;
  balanceBefore: string;
  balanceAfter: string;
  createdAt: string;
}

interface Purchase {
  id: number;
  orderId: string;
  product: {
    id: number;
    title: string;
    images?: string[];
  };
  seller: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  totalAmount: string;
  shippingCost: string;
  paymentGateway: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

interface Sale {
  id: number;
  orderId: string;
  product: {
    id: number;
    title: string;
    images?: string[];
  };
  buyer: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  totalAmount: string;
  commissionAmount: string;
  sellerAmount: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

interface BuybackOffer {
  id: number;
  itemTitle: string;
  itemDescription: string;
  itemCondition: string;
  itemBrand: string;
  itemCategory: string;
  images: string[];
  aiEvaluatedRetailPrice: string;
  buybackOfferPrice: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  adminNotes?: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

interface AccountMetrics {
  totalPurchases: number;
  totalSpent: string;
  totalSales: number;
  totalEarned: string;
  totalCommissions: string;
  activeBuybackOffers: number;
  storeCreditBalance: string;
  memberSince: string;
  totalListings: number;
  accountType: string;
}

export default function Wallet() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    document.title = "My Wallet - Opshop Online";
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to be logged in to view your wallet. Logging in...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch account metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/wallet/metrics"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch store credit transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/wallet/transactions"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch purchase history
  const { data: purchases = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ["/api/wallet/purchases"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch sales history
  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ["/api/wallet/sales"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch buyback offers
  const { data: buybackOffers = [], isLoading: buybackLoading } = useQuery({
    queryKey: ["/api/wallet/buyback-offers"],
    enabled: isAuthenticated,
    retry: false,
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned":
      case "buyback":
      case "refund":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case "spent":
        return <ArrowDownLeft className="h-4 w-4 text-red-600" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "earned":
      case "buyback":
      case "refund":
        return "text-green-600";
      case "spent":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getBuybackStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      expired: "bg-gray-100 text-gray-800",
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const getOrderStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-neutral">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <WalletIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">My Wallet</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="buyback">Buyback</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6">
              {/* Account Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Store Credit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ${parseFloat(metrics?.storeCreditBalance || "0").toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-600">Available to spend</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Total Earned
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${parseFloat(metrics?.totalEarned || "0").toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-600">{metrics?.totalSales || 0} sales</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      Total Spent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${parseFloat(metrics?.totalSpent || "0").toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-600">{metrics?.totalPurchases || 0} purchases</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Account Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">
                      {metrics?.accountType || "Seller"}
                    </div>
                    <p className="text-xs text-gray-600">
                      Member since {metrics?.memberSince ? new Date(metrics.memberSince).getFullYear() : "2024"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Active Listings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{metrics?.totalListings || 0}</div>
                    <p className="text-sm text-gray-600">Items currently for sale</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Commission Paid
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      ${parseFloat(metrics?.totalCommissions || "0").toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-600">Platform fees paid</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <RefreshCw className="h-5 w-5" />
                      Buyback Offers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{metrics?.activeBuybackOffers || 0}</div>
                    <p className="text-sm text-gray-600">Pending offers</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest transactions and activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {Array.isArray(transactions) && transactions.slice(0, 10).map((transaction: StoreCreditTransaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-gray-600">
                                {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <div className={`font-bold ${getTransactionColor(transaction.type)}`}>
                            {transaction.type === "spent" ? "-" : "+"}${parseFloat(transaction.amount).toFixed(2)}
                          </div>
                        </div>
                      ))}
                      {(!Array.isArray(transactions) || transactions.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No transactions yet</p>
                          <p className="text-sm">Start buying or selling to see your activity here</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Store Credit Transactions</CardTitle>
                <CardDescription>Complete history of your store credit activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {Array.isArray(transactions) && transactions.map((transaction: StoreCreditTransaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(transaction.createdAt).toLocaleDateString()} • 
                              Balance: ${parseFloat(transaction.balanceAfter).toFixed(2)}
                            </p>
                            {transaction.referenceType && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {transaction.referenceType}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === "spent" ? "-" : "+"}${parseFloat(transaction.amount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    {(!Array.isArray(transactions) || transactions.length === 0) && (
                      <div className="text-center py-12 text-gray-500">
                        <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No transactions yet</p>
                        <p className="text-sm">Your store credit activity will appear here</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases">
            <Card>
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
                <CardDescription>Items you have bought on Opshop Online</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {Array.isArray(purchases) && purchases.map((purchase: Purchase) => (
                      <div key={purchase.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          {purchase.product.images && purchase.product.images.length > 0 ? (
                            <img 
                              src={purchase.product.images[0]} 
                              alt={purchase.product.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{purchase.product.title}</h3>
                          <p className="text-sm text-gray-600">
                            Order #{purchase.orderId}
                          </p>
                          <p className="text-sm text-gray-600">
                            From: {purchase.seller.firstName ? 
                              `${purchase.seller.firstName} ${purchase.seller.lastName}` : 
                              purchase.seller.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(purchase.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${parseFloat(purchase.totalAmount).toFixed(2)}</div>
                          <Badge className={getOrderStatusBadge(purchase.orderStatus)}>
                            {purchase.orderStatus}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{purchase.paymentGateway}</p>
                        </div>
                      </div>
                    ))}
                    {(!Array.isArray(purchases) || purchases.length === 0) && (
                      <div className="text-center py-12 text-gray-500">
                        <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No purchases yet</p>
                        <p className="text-sm">Start shopping to see your orders here</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Sales History</CardTitle>
                <CardDescription>Items you have sold on Opshop Online</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {Array.isArray(sales) && sales.map((sale: Sale) => (
                      <div key={sale.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          {sale.product.images && sale.product.images.length > 0 ? (
                            <img 
                              src={sale.product.images[0]} 
                              alt={sale.product.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{sale.product.title}</h3>
                          <p className="text-sm text-gray-600">
                            Order #{sale.orderId}
                          </p>
                          <p className="text-sm text-gray-600">
                            To: {sale.buyer.firstName ? 
                              `${sale.buyer.firstName} ${sale.buyer.lastName}` : 
                              sale.buyer.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(sale.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            +${parseFloat(sale.sellerAmount).toFixed(2)}
                          </div>
                          <p className="text-xs text-gray-500">
                            Sale: ${parseFloat(sale.totalAmount).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Commission: ${parseFloat(sale.commissionAmount).toFixed(2)}
                          </p>
                          <Badge className={getOrderStatusBadge(sale.orderStatus)}>
                            {sale.orderStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {(!Array.isArray(sales) || sales.length === 0) && (
                      <div className="text-center py-12 text-gray-500">
                        <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No sales yet</p>
                        <p className="text-sm">List items for sale to see your earnings here</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Buyback Tab */}
          <TabsContent value="buyback">
            <Card>
              <CardHeader>
                <CardTitle>Buyback Offers</CardTitle>
                <CardDescription>AI-powered instant buyback offers for your items</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {Array.isArray(buybackOffers) && buybackOffers.map((offer: BuybackOffer) => (
                      <div key={offer.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{offer.itemTitle}</h3>
                            <p className="text-sm text-gray-600">{offer.itemBrand} • {offer.itemCondition}</p>
                            <p className="text-xs text-gray-500">{offer.itemCategory}</p>
                          </div>
                          <Badge className={getBuybackStatusBadge(offer.status)}>
                            {offer.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">AI Retail Value</p>
                            <p className="font-bold">${parseFloat(offer.aiEvaluatedRetailPrice).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Buyback Offer (50%)</p>
                            <p className="font-bold text-green-600">
                              ${parseFloat(offer.buybackOfferPrice).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {offer.status === "pending" && (
                          <div className="flex items-center gap-2 text-sm text-orange-600">
                            <Calendar className="h-4 w-4" />
                            Expires {formatDistanceToNow(new Date(offer.expiresAt), { addSuffix: true })}
                          </div>
                        )}

                        {offer.adminNotes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                            <p className="font-medium">Admin Notes:</p>
                            <p>{offer.adminNotes}</p>
                          </div>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                          Created {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                    {(!Array.isArray(buybackOffers) || buybackOffers.length === 0) && (
                      <div className="text-center py-12 text-gray-500">
                        <RefreshCw className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No buyback offers yet</p>
                        <p className="text-sm">Try our instant buyback feature to get store credit for your items</p>
                        <Button className="mt-4" onClick={() => window.location.href = "/instant-buyback"}>
                          Try Instant Buyback
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}