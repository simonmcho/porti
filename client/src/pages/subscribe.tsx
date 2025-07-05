import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Crown, CreditCard, Lock, Check } from 'lucide-react';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY ? 
  loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : null;

const planDetails = {
  premium: {
    name: 'Premium Plan',
    price: 49,
    features: [
      'Unlimited ads',
      'E-gift cards included',
      'E-loyalty program included',
      'Priority support',
      'Advanced analytics',
      'Featured listing'
    ],
    icon: Crown,
    color: 'bg-coral'
  },
  giftcards: {
    name: 'Gift Cards Add-on',
    price: 10,
    features: [
      'E-gift card functionality',
      'Custom gift card designs',
      'Automated delivery',
      'Redemption tracking'
    ],
    icon: CreditCard,
    color: 'bg-success'
  },
  loyalty: {
    name: 'Loyalty Program Add-on',
    price: 15,
    features: [
      'Custom loyalty program',
      'Points management',
      'Reward tracking',
      'Customer insights'
    ],
    icon: Check,
    color: 'bg-purple-500'
  }
};

const SubscribeForm = ({ planType }: { planType: keyof typeof planDetails }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const plan = planDetails[planType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/business-registration',
      },
    });

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Subscription Successful",
        description: "Welcome to your new plan!",
      });
      setLocation('/business-registration');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Plan Summary */}
      <Card className="border-2 border-coral">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`w-12 h-12 ${plan.color} rounded-full flex items-center justify-center mr-4`}>
                <plan.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-warm">{plan.name}</h3>
                <p className="text-coral font-medium">${plan.price}/month</p>
              </div>
            </div>
            <Badge className="bg-coral text-white">Selected</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <Check className="h-4 w-4 text-success mr-2" />
                <span className="text-sm text-gray-600">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
      </Card>

      {/* Billing Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{plan.name}</span>
              <span className="font-semibold text-gray-warm">${plan.price.toFixed(2)}/month</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Setup Fee</span>
              <span className="font-semibold text-gray-warm">$0.00</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-warm">Total Today</span>
                <span className="text-lg font-bold text-coral">${plan.price.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                You'll be charged ${plan.price.toFixed(2)} every month. Cancel anytime.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-coral text-white hover:bg-coral-light py-3 text-lg"
      >
        {isProcessing ? (
          <div className="flex items-center">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
            Processing...
          </div>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" />
            Start Subscription
          </>
        )}
      </Button>

      <div className="text-center text-sm text-gray-500 space-y-2">
        <p>Your payment is secured by Stripe</p>
        <p>By subscribing, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [planType, setPlanType] = useState<keyof typeof planDetails>("premium");
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get plan type from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan') as keyof typeof planDetails;
    
    if (plan && planDetails[plan]) {
      setPlanType(plan);
    }

    // Create subscription as soon as the page loads
    apiRequest("POST", "/api/get-or-create-subscription", { planType: plan || "premium" })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error('Error creating subscription:', error);
      });
  }, []);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-coral border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-600">Setting up your subscription...</p>
          </div>
        </div>
      </div>
    );
  }

  const plan = planDetails[planType];

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/business-registration')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Business Registration
          </Button>
          <h1 className="text-3xl font-bold text-gray-warm mb-2">
            Subscribe to {plan.name}
          </h1>
          <p className="text-gray-600">
            Unlock powerful features to grow your business on Porti
          </p>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <SubscribeForm planType={planType} />
        </Elements>
      </div>
    </div>
  );
}
