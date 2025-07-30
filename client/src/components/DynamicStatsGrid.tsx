import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Package, 
  DollarSign, 
  ShoppingBag, 
  Heart, 
  CheckCircle,
  Banknote,
  Star,
  Leaf,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useEffect } from "react";

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalSales: {
    count: number;
    amount: number;
  };
  activeListings: number;
  itemsSaved: number;
  itemsAvailable: number;
  totalSavings: number;
  sellerSatisfaction: number;
  co2SavedToday: number;
  lastUpdated: string;
}

interface TrendingStats {
  userGrowth: {
    today: number;
    yesterday: number;
    thisWeek: number;
    changeFromYesterday: number;
  };
  salesGrowth: {
    thisWeek: { count: number; amount: number };
    lastWeek: { count: number; amount: number };
    changePercent: number;
  };
  listingGrowth: {
    thisWeek: number;
    lastWeek: number;
    changePercent: number;
  };
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  format = "number",
  suffix = "" 
}: {
  title: string;
  value: number;
  icon: any;
  trend?: number;
  format?: "number" | "currency" | "percentage";
  suffix?: string;
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return `$${val.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`;
      case "percentage":
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString() + suffix;
    }
  };

  const getTrendColor = (trend?: number) => {
    if (trend === undefined) return "";
    return trend >= 0 ? "text-green-600" : "text-red-600";
  };

  const getTrendIcon = (trend?: number) => {
    if (trend === undefined) return null;
    return trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {trend !== undefined && (
          <div className={`flex items-center text-xs ${getTrendColor(trend)}`}>
            {getTrendIcon(trend)}
            <span className="ml-1">
              {trend >= 0 ? "+" : ""}{trend}% from yesterday
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DynamicStatsGrid() {
  // Fetch main dashboard stats
  const { data: stats, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard-stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch trending stats  
  const { data: trends, refetch: refetchTrends } = useQuery<TrendingStats>({
    queryKey: ["/api/admin/trending-stats"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStats();
      refetchTrends();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchStats, refetchTrends]);

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-300 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-300 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getUserTrend = () => {
    if (!trends?.userGrowth) return undefined;
    return trends.userGrowth.changeFromYesterday;
  };

  const getSalesTrend = () => {
    if (!trends?.salesGrowth) return undefined;
    return trends.salesGrowth.changePercent;
  };

  const getListingsTrend = () => {
    if (!trends?.listingGrowth) return undefined;
    return trends.listingGrowth.changePercent;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Live Statistics</h2>
        <Badge variant="outline" className="text-xs">
          Updated {new Date(stats.lastUpdated).toLocaleTimeString()}
        </Badge>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={getUserTrend()}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          trend={getListingsTrend()}
        />
        <StatCard
          title="Total Sales"
          value={stats.totalSales.amount}
          icon={DollarSign}
          trend={getSalesTrend()}
          format="currency"
        />
        <StatCard
          title="Active Listings"
          value={stats.activeListings}
          icon={ShoppingBag}
        />
        <StatCard
          title="Items Saved"
          value={stats.itemsSaved}
          icon={Heart}
        />
        <StatCard
          title="Items Available"
          value={stats.itemsAvailable}
          icon={CheckCircle}
        />
        <StatCard
          title="Total Savings"
          value={stats.totalSavings}
          icon={Banknote}
          format="currency"
        />
        <StatCard
          title="Seller Satisfaction"
          value={stats.sellerSatisfaction}
          icon={Star}
          format="number"
          suffix="/5"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Environmental Impact Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {stats.co2SavedToday.toFixed(1)} kg
          </div>
          <p className="text-sm text-muted-foreground">
            CO₂ emissions saved through second-hand purchases today
          </p>
        </CardContent>
      </Card>

      {trends && (
        <Card>
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">User Growth</p>
                <p className="text-2xl font-bold">{trends.userGrowth.thisWeek}</p>
                <p className="text-xs text-muted-foreground">new users this week</p>
              </div>
              <div>
                <p className="text-sm font-medium">Sales Growth</p>
                <p className="text-2xl font-bold">{trends.salesGrowth.thisWeek.count}</p>
                <p className="text-xs text-muted-foreground">orders this week</p>
              </div>
              <div>
                <p className="text-sm font-medium">Listing Growth</p>
                <p className="text-2xl font-bold">{trends.listingGrowth.thisWeek}</p>
                <p className="text-xs text-muted-foreground">new listings this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}