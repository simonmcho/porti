import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  Gift, 
  Plus, 
  Check,
  Heart,
  ExternalLink
} from "lucide-react";

export default function BusinessProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: business, isLoading } = useQuery({
    queryKey: [`/api/businesses/${id}`],
    enabled: !!id,
  });

  const { data: followStatus } = useQuery({
    queryKey: [`/api/businesses/${id}/is-following`],
    enabled: !!id,
  });

  const { data: loyaltyProgram } = useQuery({
    queryKey: [`/api/businesses/${id}/loyalty-program`],
    enabled: !!id,
  });

  const { data: businessAds } = useQuery({
    queryKey: [`/api/businesses/${id}/ads`],
    enabled: !!id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (followStatus?.isFollowing) {
        await apiRequest("DELETE", `/api/businesses/${id}/follow`);
      } else {
        await apiRequest("POST", `/api/businesses/${id}/follow`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${id}/is-following`] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/follows"] });
      toast({
        title: followStatus?.isFollowing ? "Unfollowed" : "Following",
        description: followStatus?.isFollowing 
          ? `You've unfollowed ${business?.name}` 
          : `You're now following ${business?.name}`,
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

  const joinLoyaltyMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/businesses/${id}/join-loyalty`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/loyalty-accounts"] });
      toast({
        title: "Joined Loyalty Program",
        description: `You've joined ${business?.name}'s loyalty program!`,
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
        description: "Failed to join loyalty program",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="text-center">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-warm mb-2">
                Business not found
              </h2>
              <p className="text-gray-600 mb-6">
                The business you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Image */}
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        <img 
          src={business.imageUrl || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=400&fit=crop"} 
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Business Header */}
        <div className="flex items-start justify-between mb-8 -mt-16 relative z-10">
          <div className="bg-white rounded-2xl p-6 shadow-lg flex-1 mr-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-warm mb-2">{business.name}</h1>
                <p className="text-gray-600 mb-2 capitalize">{business.category}</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-gray-600">{business.rating} ({business.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center text-coral font-medium">
                    <Users className="h-4 w-4 mr-1" />
                    {business.followerCount} followers
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {business.planType === 'premium' && (
                  <>
                    <Badge className="bg-success text-white">
                      <Gift className="mr-1 h-3 w-3" />
                      Gift Cards
                    </Badge>
                    <Badge className="bg-coral text-white">
                      <Star className="mr-1 h-3 w-3" />
                      Loyalty
                    </Badge>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  followStatus?.isFollowing
                    ? 'bg-success text-white hover:bg-success/90'
                    : 'bg-coral text-white hover:bg-coral-light'
                }`}
              >
                {followMutation.isPending ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : followStatus?.isFollowing ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Following
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Follow
                  </>
                )}
              </Button>
              
              {business.planType === 'premium' && (
                <Button
                  variant="outline"
                  className="border-2 border-coral text-coral px-6 py-3 rounded-full font-medium hover:bg-coral hover:text-white"
                >
                  <Gift className="mr-2 h-4 w-4" />
                  Gift Card
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {business.description || "This business hasn't added a description yet."}
                </p>
              </CardContent>
            </Card>

            {/* Current Offers */}
            <Card>
              <CardHeader>
                <CardTitle>Current Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {businessAds && businessAds.length > 0 ? (
                    businessAds.map((ad) => (
                      <div key={ad.id} className="bg-cream rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-warm">{ad.title}</h4>
                            <p className="text-sm text-gray-600">{ad.description}</p>
                          </div>
                          <Badge className="bg-coral text-white">Active</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No current offers available</p>
                    </div>
                  )}
                  
                  {loyaltyProgram && (
                    <div className="bg-cream rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-warm">{loyaltyProgram.name}</h4>
                          <p className="text-sm text-gray-600">{loyaltyProgram.description}</p>
                        </div>
                        <Button
                          onClick={() => joinLoyaltyMutation.mutate()}
                          disabled={joinLoyaltyMutation.isPending}
                          className="bg-success text-white hover:bg-success/90"
                        >
                          {joinLoyaltyMutation.isPending ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <>
                              <Plus className="mr-1 h-3 w-3" />
                              Join
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {business.address && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-coral mr-3 mt-0.5" />
                    <span className="text-gray-600">{business.address}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-coral mr-3" />
                    <span className="text-gray-600">{business.phone}</span>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-coral mr-3" />
                    <span className="text-gray-600">{business.email}</span>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-coral mr-3" />
                    <a 
                      href={business.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-coral hover:text-coral-light flex items-center"
                    >
                      Visit Website
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Loyalty Status */}
            {loyaltyProgram && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Loyalty Status</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="w-16 h-16 bg-coral rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-xl">0</span>
                  </div>
                  <p className="text-gray-600 text-sm">Points earned</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {loyaltyProgram.rewardThreshold} points for a reward!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
