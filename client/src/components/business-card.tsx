import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import { Star, Gift, Users, Plus, Check, MapPin, Phone } from "lucide-react";

interface BusinessCardProps {
  business: {
    id: number;
    name: string;
    description: string;
    category: string;
    address: string;
    phone: string;
    imageUrl: string;
    rating: string;
    reviewCount: number;
    followerCount: number;
    planType: string;
  };
}

export function BusinessCard({ business }: BusinessCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is following this business
  const { data: followStatus } = useQuery({
    queryKey: [`/api/businesses/${business.id}/is-following`],
    retry: false,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await apiRequest("DELETE", `/api/businesses/${business.id}/follow`);
      } else {
        await apiRequest("POST", `/api/businesses/${business.id}/follow`);
      }
    },
    onSuccess: () => {
      setIsFollowing(!isFollowing);
      queryClient.invalidateQueries({ queryKey: ["/api/user/follows"] });
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing 
          ? `You've unfollowed ${business.name}` 
          : `You're now following ${business.name}`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    },
  });

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    followMutation.mutate();
  };

  // Set following status from query
  useState(() => {
    if (followStatus?.isFollowing !== undefined) {
      setIsFollowing(followStatus.isFollowing);
    }
  });

  return (
    <Link href={`/business-profile/${business.id}`}>
      <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          <img 
            src={business.imageUrl || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop"} 
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            {business.planType === 'premium' && (
              <Badge className="bg-success text-white">
                <Gift className="mr-1 h-3 w-3" />
                Gift Cards
              </Badge>
            )}
          </div>
          <div className="absolute top-4 right-4">
            {business.planType === 'premium' && (
              <Badge className="bg-coral text-white">
                <Star className="mr-1 h-3 w-3" />
                Loyalty
              </Badge>
            )}
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-gray-warm">{business.name}</h3>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-gray-600">{business.rating}</span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-1 capitalize">{business.category}</p>
          
          {business.address && (
            <div className="flex items-center text-gray-500 text-sm mb-2">
              <MapPin className="h-3 w-3 mr-1" />
              {business.address}
            </div>
          )}
          
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
            {business.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-coral font-medium">
              <Users className="h-4 w-4 mr-1" />
              {business.followerCount} followers
            </div>
            
            <Button
              onClick={handleFollow}
              disabled={followMutation.isPending}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                isFollowing
                  ? 'bg-success text-white hover:bg-success/90'
                  : 'bg-coral text-white hover:bg-coral-light'
              }`}
            >
              {followMutation.isPending ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : isFollowing ? (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  Following
                </>
              ) : (
                <>
                  <Plus className="mr-1 h-3 w-3" />
                  Follow
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
