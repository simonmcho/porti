import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY ? 
  loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : null;

const CheckoutForm = ({ amount, businessName }: { amount: number; businessName: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/user-dashboard',
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
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
      setLocation('/user-dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Gift Card for {businessName}</span>
            <span className="font-semibold text-gray-warm">${amount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Processing Fee</span>
            <span className="font-semibold text-gray-warm">$0.00</span>
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-warm">Total</span>
              <span className="text-lg font-bold text-coral">${amount.toFixed(2)}</span>
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
            Complete Payment
          </>
        )}
      </Button>

      <div className="text-center text-sm text-gray-500">
        <p>Your payment is secured by Stripe</p>
      </div>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState(50); // Default amount
  const [businessName, setBusinessName] = useState("Selected Business");
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get checkout data from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const amountParam = urlParams.get('amount');
    const businessParam = urlParams.get('business');
    
    if (amountParam) {
      setAmount(parseFloat(amountParam));
    }
    if (businessParam) {
      setBusinessName(decodeURIComponent(businessParam));
    }

    // Create PaymentIntent as soon as the page loads
    apiRequest("POST", "/api/create-payment-intent", { amount: amountParam ? parseFloat(amountParam) : 50 })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error('Error creating payment intent:', error);
      });
  }, []);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-coral border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-600">Setting up your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/user-dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-warm mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-gray-600">
            You're purchasing a gift card for {businessName}
          </p>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm amount={amount} businessName={businessName} />
        </Elements>
      </div>
    </div>
  );
}
