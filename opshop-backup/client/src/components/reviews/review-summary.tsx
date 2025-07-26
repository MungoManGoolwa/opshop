import { useQuery } from "@tanstack/react-query";
import { Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ReviewSummaryProps {
  userId: string;
  showTitle?: boolean;
}

export default function ReviewSummary({ userId, showTitle = true }: ReviewSummaryProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: [`/api/reviews/stats/${userId}`],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                  <div className="h-2 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No reviews yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? "" : "pt-6"}>
        {/* Overall Rating */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(stats.averageRating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">
              {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingBreakdown[rating] || 0;
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-2 mb-1">
                  <div className="flex items-center space-x-1 w-12">
                    <span className="text-sm">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  </div>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quality Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((stats.ratingBreakdown[5] + stats.ratingBreakdown[4]) / stats.totalReviews * 100)}%
            </div>
            <div className="text-sm text-green-700">Positive Reviews</div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">
              {stats.averageRating >= 4.5 ? 'Excellent' : 
               stats.averageRating >= 4.0 ? 'Very Good' : 
               stats.averageRating >= 3.5 ? 'Good' : 
               stats.averageRating >= 3.0 ? 'Fair' : 'Poor'}
            </div>
            <div className="text-sm text-blue-700">Overall Rating</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalReviews >= 100 ? '100+' : stats.totalReviews}
            </div>
            <div className="text-sm text-purple-700">Total Reviews</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}