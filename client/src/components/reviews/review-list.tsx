import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import ReviewCard from "./review-card";

interface ReviewListProps {
  userId?: string;
  productId?: number;
  title?: string;
  limit?: number;
}

export default function ReviewList({ userId, productId, title, limit }: ReviewListProps) {
  const endpoint = userId ? `/api/reviews/user/${userId}` : `/api/reviews/product/${productId}`;
  
  const { data: reviews, isLoading, error } = useQuery({
    queryKey: [endpoint],
    enabled: !!(userId || productId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-red-500">
          Failed to load reviews. Please try again.
        </CardContent>
      </Card>
    );
  }

  const displayReviews = limit ? reviews?.slice(0, limit) : reviews;

  if (!displayReviews || displayReviews.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No reviews yet</p>
            <p className="text-sm">Be the first to leave a review!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              {title}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({displayReviews.length} review{displayReviews.length !== 1 ? 's' : ''})
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      )}
      
      {displayReviews.map((review: any) => (
        <ReviewCard key={review.id} review={review} />
      ))}
      
      {limit && reviews && reviews.length > limit && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">
              Showing {limit} of {reviews.length} reviews
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}