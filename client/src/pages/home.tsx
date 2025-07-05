import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { SearchFilters } from "@/components/search-filters";
import { BusinessCard } from "@/components/business-card";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Heart, Gift, Star, Plus } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  
  const { data: businesses, isLoading } = useQuery({
    queryKey: ["/api/businesses"],
  });

  const { data: userFollows } = useQuery({
    queryKey: ["/api/user/follows"],
  });

  const { data: userGiftCards } = useQuery({
    queryKey: ["/api/user/gift-cards"],
  });

  const { data: userLoyaltyAccounts } = useQuery({
    queryKey: ["/api/user/loyalty-accounts"],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Welcome Section */}
      <section className="bg-gradient-to-br from-cream to-cream-dark py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-warm mb-2">
                Welcome back, {user?.firstName || 'there'}!
              </h1>
              <p className="text-gray-600">Discover amazing local businesses and earn rewards</p>
            </div>
            <div className="hidden md:flex space-x-4">
              <Link href="/user-dashboard">
                <Button variant="outline" className="border-coral text-coral hover:bg-coral hover:text-white">
                  Dashboard
                </Button>
              </Link>
              <Link href="/business-registration">
                <Button className="bg-coral text-white hover:bg-coral-light">
                  <Plus className="mr-2 h-4 w-4" />
                  List Your Business
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-warm">
                  {userFollows?.length || 0}
                </h3>
                <p className="text-gray-600">Businesses Following</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-warm">
                  ${userGiftCards?.reduce((sum, card) => sum + parseFloat(card.balance), 0).toFixed(2) || '0.00'}
                </h3>
                <p className="text-gray-600">Gift Cards Balance</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-warm">
                  {userLoyaltyAccounts?.reduce((sum, account) => sum + account.points, 0) || 0}
                </h3>
                <p className="text-gray-600">Loyalty Points</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <SearchFilters />

      {/* Business Listings */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-warm">Featured Businesses</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="p-2 rounded-full bg-gray-100 hover:bg-white hover:shadow-lg transition-all"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-none shadow-lg overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-10 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businesses?.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
          
          {!isLoading && (!businesses || businesses.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No businesses found. Be the first to list your business!</p>
              <Link href="/business-registration">
                <Button className="mt-4 bg-coral text-white hover:bg-coral-light">
                  List Your Business
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
