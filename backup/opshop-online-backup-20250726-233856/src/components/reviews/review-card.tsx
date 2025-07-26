import { formatDistanceToNow } from "date-fns";
import { Star, ThumbsUp, ShoppingBag, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ReviewCardProps {
  review: {
    id: number;
    rating: number;
    title?: string;
    comment?: string;
    reviewType: string;
    isVerified: boolean;
    helpfulCount: number;
    createdAt: string;
    reviewer: {
      id: string;
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
    };
    product?: {
      id: number;
      title: string;
    };
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markHelpfulMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/reviews/${review.id}/helpful`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({
        title: "Marked as Helpful",
        description: "Thank you for your feedback!",
      });
    },
  });

  const getReviewerName = () => {
    if (review.reviewer.firstName || review.reviewer.lastName) {
      return `${review.reviewer.firstName || ''} ${review.reviewer.lastName || ''}`.trim();
    }
    return "Anonymous User";
  };

  const getReviewerInitials = () => {
    const name = getReviewerName();
    if (name === "Anonymous User") return "AU";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          {/* Reviewer Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarImage src={review.reviewer.profileImageUrl} />
            <AvatarFallback>{getReviewerInitials()}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            {/* Header with rating and badges */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold">{getReviewerName()}</h4>
                {review.isVerified && (
                  <Badge variant="outline" className="text-xs">
                    <ShoppingBag className="h-3 w-3 mr-1" />
                    Verified Purchase
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs capitalize">
                  {review.reviewType}
                </Badge>
              </div>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </span>
            </div>

            {/* Star Rating */}
            <div className="flex items-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.rating
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {review.rating} out of 5 stars
              </span>
            </div>

            {/* Review Title */}
            {review.title && (
              <h5 className="font-medium mb-2">{review.title}</h5>
            )}

            {/* Review Comment */}
            {review.comment && (
              <p className="text-gray-700 mb-3 leading-relaxed">
                {review.comment}
              </p>
            )}

            {/* Product Reference */}
            {review.product && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  <span>Product: {review.product.title}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markHelpfulMutation.mutate()}
                disabled={markHelpfulMutation.isPending}
                className="text-gray-600 hover:text-gray-800"
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Helpful ({review.helpfulCount})
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}