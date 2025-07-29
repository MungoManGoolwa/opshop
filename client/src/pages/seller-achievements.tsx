import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  Heart,
  Clock,
  Leaf,
  Crown,
  Zap,
  Calendar,
  ThumbsUp
} from "lucide-react";

interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  badgeColor: string;
  requirement: any;
  reward: any;
  displayOrder: number;
}

interface AchievementProgress {
  achievementId: number;
  currentValue: number;
  targetValue: number;
  isCompleted: boolean;
  progressPercentage: number;
}

interface SellerStats {
  totalSales: number;
  totalRevenue: string;
  totalListings: number;
  activeListings: number;
  averageRating: string;
  totalReviews: number;
  level: number;
  experiencePoints: number;
  consecutiveSaleDays: number;
}

interface UserAchievement {
  achievement: Achievement;
  userAchievement: {
    unlockedAt: string;
    isDisplayed: boolean;
  };
}

interface SellerBadge {
  badgeType: string;
  badgeLevel: number;
  earnedAt: string;
  expiresAt?: string;
  criteria: any;
}

const iconMap: Record<string, any> = {
  trophy: Trophy,
  star: Star,
  award: Award,
  target: Target,
  'trending-up': TrendingUp,
  users: Users,
  package: Package,
  'dollar-sign': DollarSign,
  heart: Heart,
  clock: Clock,
  leaf: Leaf,
  crown: Crown,
  zap: Zap,
  calendar: Calendar,
  'thumbs-up': ThumbsUp,
  list: Package,
};

const badgeColorMap: Record<string, string> = {
  green: "bg-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  gold: "bg-yellow-500",
  orange: "bg-orange-500",
  indigo: "bg-indigo-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
  pink: "bg-pink-500",
  cyan: "bg-cyan-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
};

export default function SellerAchievements() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<AchievementProgress[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [badges, setBadges] = useState<SellerBadge[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [achievementsRes, progressRes, userAchievementsRes, badgesRes, statsRes] = await Promise.all([
        apiRequest("GET", "/api/achievements"),
        apiRequest("GET", "/api/achievements/progress"),
        apiRequest("GET", "/api/achievements/user"),
        apiRequest("GET", "/api/achievements/badges"),
        apiRequest("GET", "/api/achievements/stats"),
      ]);

      setAchievements(achievementsRes);
      setProgress(progressRes);
      setUserAchievements(userAchievementsRes);
      setBadges(badgesRes);
      setStats(statsRes);
    } catch (error) {
      console.error("Error fetching achievement data:", error);
      toast({
        title: "Error",
        description: "Failed to load achievement data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressForAchievement = (achievementId: number) => {
    return progress.find(p => p.achievementId === achievementId);
  };

  const getLevelProgress = () => {
    if (!stats) return { current: 0, next: 100, percentage: 0 };
    const currentLevelXP = (stats.level - 1) * 100;
    const nextLevelXP = stats.level * 100;
    const currentProgress = stats.experiencePoints - currentLevelXP;
    const percentage = (currentProgress / 100) * 100;
    
    return {
      current: currentProgress,
      next: 100,
      percentage: Math.min(100, percentage)
    };
  };

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const progressData = getProgressForAchievement(achievement.id);
    const IconComponent = iconMap[achievement.icon] || Trophy;
    const isCompleted = progressData?.isCompleted || false;

    return (
      <Card className={`transition-all duration-200 hover:shadow-md ${isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${isCompleted ? 'bg-green-500' : badgeColorMap[achievement.badgeColor] || 'bg-gray-500'}`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{achievement.name}</CardTitle>
                <CardDescription className="text-sm">{achievement.description}</CardDescription>
              </div>
            </div>
            {isCompleted && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                <Trophy className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {progressData && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progressData.currentValue} / {progressData.targetValue}</span>
              </div>
              <Progress value={progressData.progressPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {progressData.progressPercentage.toFixed(0)}% complete
              </div>
            </div>
          )}
          {achievement.reward && (
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-xs font-medium text-blue-800 dark:text-blue-200">Reward:</div>
              <div className="text-xs text-blue-600 dark:text-blue-300">
                {achievement.reward.description}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const BadgeCard = ({ badge }: { badge: SellerBadge }) => {
    const badgeLevels = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const levelColors = ['bg-amber-600', 'bg-gray-400', 'bg-yellow-500', 'bg-purple-500'];
    
    return (
      <Card className="border-2">
        <CardContent className="p-4 text-center">
          <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${levelColors[badge.badgeLevel - 1]} flex items-center justify-center`}>
            <Award className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold capitalize">{badge.badgeType.replace(/_/g, ' ')}</h3>
          <p className="text-sm text-muted-foreground">{badgeLevels[badge.badgeLevel - 1]}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Earned {new Date(badge.earnedAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your achievements</h1>
        <Button onClick={() => window.location.href = '/api/login'}>
          Log In
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const levelProgress = getLevelProgress();
  const categorizedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) acc[achievement.category] = [];
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Seller Achievements</h1>
        <p className="text-muted-foreground">
          Track your progress and unlock rewards as you grow your business on Opshop Online.
        </p>
      </div>

      {stats && (
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-6 h-6 text-yellow-500" />
              <span>Level {stats.level} Seller</span>
            </CardTitle>
            <CardDescription>
              {stats.experiencePoints} XP • {levelProgress.current}/{levelProgress.next} XP to next level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={levelProgress.percentage} className="h-3 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalSales}</div>
                <div className="text-sm text-muted-foreground">Total Sales</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">${stats.totalRevenue}</div>
                <div className="text-sm text-muted-foreground">Revenue</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.totalListings}</div>
                <div className="text-sm text-muted-foreground">Listings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.averageRating}</div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                {userAchievements.slice(0, 3).map((ua, index) => (
                  <div key={index} className="flex items-center space-x-3 py-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <div>
                      <div className="font-medium">{ua.achievement.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(ua.userAchievement.unlockedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                {userAchievements.length === 0 && (
                  <p className="text-muted-foreground">No achievements unlocked yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {badges.slice(0, 6).map((badge, index) => (
                    <BadgeCard key={index} badge={badge} />
                  ))}
                </div>
                {badges.length === 0 && (
                  <p className="text-muted-foreground">No badges earned yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {Object.entries(categorizedAchievements).map(([category, categoryAchievements]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4 capitalize">{category} Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {categoryAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {badges.map((badge, index) => (
              <BadgeCard key={index} badge={badge} />
            ))}
          </div>
          {badges.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Badges Yet</h3>
                <p className="text-muted-foreground">
                  Complete achievements to earn your first badge!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="space-y-4">
            {progress.map((progressItem) => {
              const achievement = achievements.find(a => a.id === progressItem.achievementId);
              if (!achievement) return null;

              const IconComponent = iconMap[achievement.icon] || Trophy;

              return (
                <Card key={progressItem.achievementId}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${progressItem.isCompleted ? 'bg-green-500' : badgeColorMap[achievement.badgeColor] || 'bg-gray-500'}`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">{achievement.name}</h3>
                          <span className="text-sm text-muted-foreground">
                            {progressItem.currentValue} / {progressItem.targetValue}
                          </span>
                        </div>
                        <Progress value={progressItem.progressPercentage} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {progressItem.progressPercentage.toFixed(0)}% complete
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}