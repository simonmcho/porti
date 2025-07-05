import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { 
  Heart, 
  Gift, 
  Star, 
  User, 
  Settings, 
  CreditCard,
  TrendingUp,
  Clock,
  MapPin
} from "lucide-react";

export default function UserDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: userFollows, isLoading: followsLoading } = useQuery({
    queryKey: ["/api/user/follows"],
    enabled: isAuthenticated,
  });

  const { data: userGiftCards, isLoading: giftCardsLoading } = useQuery({
    queryKey: ["/api/user/gift-cards"],
    enabled: isAuthenticated,
  });

  const { data: userLoyaltyAccounts, isLoading: loyaltyLoading } = useQuery({
    queryKey: ["/api/user/loyalty-accounts"],
    enabled: isAuthenticated,
  });

  const { data: userTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/user/transactions"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const totalGiftCardBalance = userGiftCards?.reduce((sum, card) => sum + parseFloat(card.balance), 0) || 0;
  const totalLoyaltyPoints = userLoyaltyAccounts?.reduce((sum, account) => sum + account.points, 0) || 0;
  const followsCount = userFollows?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-coral rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-warm">
                  Welcome back, {user?.firstName || 'there'}!
                </h1>
                <p className="text-gray-600">Member since {new Date(user?.createdAt || '').toLocaleDateString()}</p>
              </div>
            </div>
            <Button className="bg-coral text-white hover:bg-coral-light">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-cream border-none shadow-lg">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-coral mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-warm">{followsCount}</h3>
              <p className="text-gray-600">Businesses Following</p>
            </CardContent>
          </Card>
          
          <Card className="bg-cream border-none shadow-lg">
            <CardContent className="p-6 text-center">
              <Gift className="h-8 w-8 text-coral mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-warm">${totalGiftCardBalance.toFixed(2)}</h3>
              <p className="text-gray-600">Gift Cards Balance</p>
            </CardContent>
          </Card>
          
          <Card className="bg-cream border-none shadow-lg">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-coral mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-warm">{totalLoyaltyPoints}</h3>
              <p className="text-gray-600">Loyalty Points</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Loyalty Programs */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5 text-coral" />
                Your Loyalty Programs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loyaltyLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : userLoyaltyAccounts && userLoyaltyAccounts.length > 0 ? (
                <div className="space-y-4">
                  {userLoyaltyAccounts.map((account) => (
                    <div key={account.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-warm">Business #{account.businessId}</h4>
                        <span className="text-coral font-medium">{account.points} pts</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-coral h-2 rounded-full" 
                          style={{ width: `${Math.min((account.points / 100) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.max(100 - account.points, 0)} more points for a reward
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No loyalty programs joined yet</p>
                  <Link href="/">
                    <Button className="mt-4 bg-coral text-white hover:bg-coral-light">
                      Discover Businesses
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gift Cards */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="mr-2 h-5 w-5 text-coral" />
                Your Gift Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              {giftCardsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : userGiftCards && userGiftCards.length > 0 ? (
                <div className="space-y-4">
                  {userGiftCards.map((giftCard) => (
                    <div key={giftCard.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-warm">Business #{giftCard.businessId}</h4>
                          <p className="text-sm text-gray-600">
                            Expires: {giftCard.expiresAt ? new Date(giftCard.expiresAt).toLocaleDateString() : 'No expiry'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Code: {giftCard.code}</p>
                        </div>
                        <span className="text-success font-medium text-lg">${parseFloat(giftCard.balance).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No gift cards yet</p>
                  <Link href="/">
                    <Button className="mt-4 bg-coral text-white hover:bg-coral-light">
                      Browse Businesses
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-coral" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : userTransactions && userTransactions.length > 0 ? (
              <div className="space-y-4">
                {userTransactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-coral rounded-full flex items-center justify-center">
                        {transaction.type === 'giftcard_purchase' ? (
                          <Gift className="h-4 w-4 text-white" />
                        ) : transaction.type === 'giftcard_redemption' ? (
                          <CreditCard className="h-4 w-4 text-white" />
                        ) : (
                          <Star className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-warm">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`font-medium ${
                      transaction.type === 'giftcard_redemption' ? 'text-red-600' : 'text-success'
                    }`}>
                      {transaction.type === 'giftcard_redemption' ? '-' : '+'}${parseFloat(transaction.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
