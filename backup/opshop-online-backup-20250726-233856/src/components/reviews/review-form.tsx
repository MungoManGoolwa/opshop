import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertReviewSchema } from "@shared/schema";

const reviewFormSchema = insertReviewSchema.extend({
  rating: z.number().min(1).max(5),
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  orderId?: number;
  revieweeId: string;
  productId?: number;
  reviewType: "seller" | "buyer" | "product";
  revieweeName: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ 
  orderId, 
  revieweeId, 
  productId, 
  reviewType, 
  revieweeName,
  onSuccess 
}: ReviewFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      orderId,
      revieweeId,
      productId,
      reviewType,
      rating: 0,
      title: "",
      comment: "",
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const response = await apiRequest("POST", "/api/reviews", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    createReviewMutation.mutate(data);
  };

  const rating = form.watch("rating");

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Leave a Review for {revieweeName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Star Rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="focus:outline-none"
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => field.onChange(star)}
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              star <= (hoveredRating || rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {rating > 0 && `${rating} star${rating !== 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Review Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Summarize your experience..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Review Comment */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share details about your experience..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={createReviewMutation.isPending || rating === 0}
              className="w-full"
            >
              {createReviewMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Review
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}