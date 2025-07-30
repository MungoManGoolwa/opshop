import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ConfettiCannon, { useConfetti } from "@/components/animations/confetti-cannon";
import { Star, ThumbsUp, TrendingUp, Award } from "lucide-react";

interface FeedbackCelebrationProps {
  latestReview?: {
    id: string;
    rating: number;
    comment: string;
    buyerName: string;
    productName: string;
    createdAt: string;
  };
  sellerStats?: {
    totalReviews: number;
    averageRating: number;
    totalSales: number;
    achievementLevel: string;
  };
}

export default function FeedbackCelebration({ 
  latestReview, 
  sellerStats 
}: FeedbackCelebrationProps) {
  const { isActive, trigger } = useConfetti();
  const [lastCelebrationTime, setLastCelebrationTime] = useState<string | null>(null);
  const [showCelebrationCard, setShowCelebrationCard] = useState(false);

  // Check if we should celebrate a new review
  useEffect(() => {
    if (!latestReview) return;

    const reviewTime = new Date(latestReview.createdAt).getTime();
    const lastCelebration = lastCelebrationTime ? new Date(lastCelebrationTime).getTime() : 0;
    
    // Celebrate if it's a new review (within last 5 minutes) and rating is 4 or 5 stars
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const isNewReview = reviewTime > Math.max(lastCelebration, fiveMinutesAgo);
    const isHighRating = latestReview.rating >= 4;

    if (isNewReview && isHighRating) {
      setShowCelebrationCard(true);
      trigger('review');
      setLastCelebrationTime(latestReview.createdAt);
      
      // Auto-hide celebration card after 10 seconds
      setTimeout(() => setShowCelebrationCard(false), 10000);
    }
  }, [latestReview, lastCelebrationTime, trigger]);

  // Check for milestone achievements
  useEffect(() => {
    if (!sellerStats) return;

    const milestones = [
      { threshold: 10, type: 'milestone' as const, message: '10 Reviews Milestone!' },
      { threshold: 50, type: 'milestone' as const, message: '50 Reviews Milestone!' },
      { threshold: 100, type: 'milestone' as const, message: '100 Reviews Milestone!' },
      { threshold: 500, type: 'milestone' as const, message: '500 Reviews Milestone!' },
    ];

    milestones.forEach(milestone => {
      if (sellerStats.totalReviews === milestone.threshold) {
        setTimeout(() => trigger(milestone.type), 2000);
      }
    });
  }, [sellerStats, trigger]);

  const triggerManualCelebration = (type: 'review' | 'sale' | 'milestone' | 'achievement') => {
    trigger(type);
    setShowCelebrationCard(true);
    setTimeout(() => setShowCelebrationCard(false), 8000);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <>
      <ConfettiCannon 
        isActive={isActive} 
        duration={3000}
        intensity={60}
        trigger="review"
      />

      <div className="space-y-6">
        {/* Latest Review Celebration */}
        {showCelebrationCard && latestReview && (
          <Card className="border-green-200 bg-green-50 shadow-lg animate-pulse">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <ThumbsUp className="h-5 w-5" />
                New {latestReview.rating === 5 ? 'Perfect' : 'Great'} Review!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(latestReview.rating)}
                  </div>
                  <Badge variant="secondary">
                    {latestReview.rating} stars
                  </Badge>
                </div>
                
                <blockquote className="italic text-gray-700 border-l-4 border-green-400 pl-4">
                  "{latestReview.comment}"
                </blockquote>
                
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>From: {latestReview.buyerName}</span>
                  <span>Product: {latestReview.productName}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seller Achievement Dashboard */}
        {sellerStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Your Seller Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {sellerStats.totalReviews}
                  </div>
                  <div className="text-sm text-gray-600">Total Reviews</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl font-bold text-primary">
                      {sellerStats.averageRating.toFixed(1)}
                    </span>
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {sellerStats.totalSales}
                  </div>
                  <div className="text-sm text-gray-600">Total Sales</div>
                </div>
                
                <div className="text-center">
                  <Badge variant="outline" className="text-primary border-primary">
                    {sellerStats.achievementLevel}
                  </Badge>
                  <div className="text-sm text-gray-600 mt-1">Achievement Level</div>
                </div>
              </div>

              {/* Next Milestone Progress */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Progress to next milestone:</span>
                  <span className="font-medium">
                    {sellerStats.totalReviews} / {
                      sellerStats.totalReviews < 10 ? 10 :
                      sellerStats.totalReviews < 50 ? 50 :
                      sellerStats.totalReviews < 100 ? 100 : 500
                    } reviews
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (sellerStats.totalReviews / (
                        sellerStats.totalReviews < 10 ? 10 :
                        sellerStats.totalReviews < 50 ? 50 :
                        sellerStats.totalReviews < 100 ? 100 : 500
                      )) * 100)}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Celebration Triggers (for testing/demo) */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Test Celebrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerManualCelebration('review')}
                className="flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                Review
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerManualCelebration('sale')}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Sale
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerManualCelebration('milestone')}
                className="flex items-center gap-2"
              >
                <Award className="h-4 w-4" />
                Milestone
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerManualCelebration('achievement')}
                className="flex items-center gap-2"
              >
                <ThumbsUp className="h-4 w-4" />
                Achievement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}