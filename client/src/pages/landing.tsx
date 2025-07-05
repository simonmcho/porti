import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Gift, Star, Users, Search, Filter } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-cream-dark">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Store className="text-coral text-2xl mr-2" />
                <span className="text-2xl font-bold text-gray-warm">Porti</span>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <a href="#" className="text-gray-warm hover:text-coral px-3 py-2 rounded-md text-sm font-medium">Discover</a>
                  <a href="#" className="text-gray-warm hover:text-coral px-3 py-2 rounded-md text-sm font-medium">For Businesses</a>
                  <a href="#" className="text-gray-warm hover:text-coral px-3 py-2 rounded-md text-sm font-medium">Gift Cards</a>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-coral text-white hover:bg-coral-light"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-warm mb-6">
              Discover Amazing
              <span className="text-coral"> Local Businesses</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with your community. Earn rewards. Support local businesses. 
              Find exclusive deals and gift cards from businesses you love.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-coral text-white px-8 py-3 text-lg hover:bg-coral-light shadow-lg"
              >
                <Search className="mr-2 h-5 w-5" />
                Explore Businesses
              </Button>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                variant="outline"
                className="border-2 border-coral text-coral px-8 py-3 text-lg hover:bg-coral hover:text-white"
              >
                Join as Business
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-warm mb-4">Why Choose Porti?</h2>
            <p className="text-xl text-gray-600">Everything you need to connect with your local community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-coral rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-warm mb-2">Gift Cards</h3>
                <p className="text-gray-600">Purchase and redeem gift cards from your favorite local businesses</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-coral rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-warm mb-2">Loyalty Programs</h3>
                <p className="text-gray-600">Earn points and rewards for every purchase at participating businesses</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-coral rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-warm mb-2">Community</h3>
                <p className="text-gray-600">Follow your favorite businesses and stay updated on their latest offers</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Business Registration CTA */}
      <section className="py-16 bg-gradient-to-br from-coral to-coral-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-12">
            <h2 className="text-4xl font-bold mb-4">Join the Porti Community</h2>
            <p className="text-xl opacity-90">Connect with local customers and grow your business</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card className="border-none shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-coral rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">👑</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-warm">Premium Plan</h3>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-warm">$49</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Unlimited ads
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    E-gift cards included
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    E-loyalty program included
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Priority support
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="w-full bg-coral text-white hover:bg-coral-light"
                >
                  Start Premium Trial
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Store className="text-gray-600 mr-3" size={24} />
                  <h3 className="text-xl font-semibold text-gray-warm">Basic Plan</h3>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-warm">Free</span>
                  <span className="text-gray-600"> to start</span>
                </div>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Basic business profile
                  </li>
                  <li className="flex items-center">
                    <span className="text-red-400 mr-2">✗</span>
                    Pay per ad ($5 each)
                  </li>
                  <li className="flex items-center">
                    <span className="text-orange-400 mr-2">$</span>
                    E-gift cards ($10/month)
                  </li>
                  <li className="flex items-center">
                    <span className="text-orange-400 mr-2">$</span>
                    E-loyalty program ($15/month)
                  </li>
                </ul>
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  variant="outline"
                  className="w-full border-2 border-gray-300 text-gray-600 hover:bg-gray-100"
                >
                  Start Basic Plan
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <p className="text-white mb-4 opacity-90">Ready to get started? Create your business profile in minutes.</p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-white text-coral px-8 py-4 text-lg font-medium hover:bg-gray-100 shadow-lg"
            >
              Create Business Profile
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-warm text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Store className="text-coral mr-2" size={24} />
                <span className="text-2xl font-bold">Porti</span>
              </div>
              <p className="text-gray-300 mb-4">Connecting communities with local businesses through rewards, loyalty, and gift cards.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-coral transition-colors">Discover Businesses</a></li>
                <li><a href="#" className="hover:text-coral transition-colors">Gift Cards</a></li>
                <li><a href="#" className="hover:text-coral transition-colors">Loyalty Programs</a></li>
                <li><a href="#" className="hover:text-coral transition-colors">Mobile App</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Businesses</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-coral transition-colors">List Your Business</a></li>
                <li><a href="#" className="hover:text-coral transition-colors">Pricing Plans</a></li>
                <li><a href="#" className="hover:text-coral transition-colors">Business Dashboard</a></li>
                <li><a href="#" className="hover:text-coral transition-colors">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-coral transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-coral transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-coral transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-coral transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Porti. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
