import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertBusinessSchema } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { Store, Crown, CreditCard, CheckCircle, ArrowLeft } from "lucide-react";
import { z } from "zod";

const businessFormSchema = insertBusinessSchema.omit({ ownerId: true });

export default function BusinessRegistration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium">("basic");

  const form = useForm<z.infer<typeof businessFormSchema>>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      imageUrl: "",
      planType: "basic",
      isActive: true,
    },
  });

  // Check if user already has a business
  const { data: existingBusiness } = useQuery({
    queryKey: ["/api/my-business"],
    retry: false,
  });

  const createBusinessMutation = useMutation({
    mutationFn: async (data: z.infer<typeof businessFormSchema>) => {
      const response = await apiRequest("POST", "/api/businesses", data);
      return response.json();
    },
    onSuccess: (business) => {
      toast({
        title: "Business Created",
        description: "Your business has been successfully registered!",
      });
      setLocation(`/business-profile/${business.id}`);
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
        description: "Failed to create business. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof businessFormSchema>) => {
    createBusinessMutation.mutate({ ...data, planType: selectedPlan });
  };

  if (existingBusiness) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="text-center">
            <CardContent className="p-8">
              <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-warm mb-2">
                You already have a business!
              </h2>
              <p className="text-gray-600 mb-6">
                You can only have one business per account. Manage your existing business or create a new account.
              </p>
              <div className="space-y-4">
                <Link href={`/business-profile/${existingBusiness.id}`}>
                  <Button className="w-full bg-coral text-white hover:bg-coral-light">
                    View My Business
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-warm mb-2">
            Register Your Business
          </h1>
          <p className="text-gray-600">
            Join the Porti community and start connecting with local customers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="mr-2 h-5 w-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your business name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="restaurant">Restaurant</SelectItem>
                                <SelectItem value="retail">Retail</SelectItem>
                                <SelectItem value="service">Service</SelectItem>
                                <SelectItem value="health">Health & Beauty</SelectItem>
                                <SelectItem value="fitness">Fitness</SelectItem>
                                <SelectItem value="entertainment">Entertainment</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your business..."
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Tell customers what makes your business special
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="business@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St, City, State 12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://yourwebsite.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Image URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-coral text-white hover:bg-coral-light"
                      disabled={createBusinessMutation.isPending}
                    >
                      {createBusinessMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Creating Business...
                        </div>
                      ) : (
                        "Create Business"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Plan Selection */}
          <div className="space-y-6">
            <Card className={`cursor-pointer transition-all ${selectedPlan === 'basic' ? 'ring-2 ring-coral' : ''}`}>
              <CardContent className="p-6" onClick={() => setSelectedPlan('basic')}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Store className="text-gray-600 mr-3" size={20} />
                    <h3 className="text-lg font-semibold text-gray-warm">Basic Plan</h3>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${selectedPlan === 'basic' ? 'bg-coral border-coral' : 'border-gray-300'}`} />
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-gray-warm">Free</span>
                  <span className="text-gray-600"> to start</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success mr-2" />
                    Basic business profile
                  </li>
                  <li className="flex items-center">
                    <CreditCard className="h-4 w-4 text-orange-400 mr-2" />
                    Pay per ad ($5 each)
                  </li>
                  <li className="flex items-center">
                    <CreditCard className="h-4 w-4 text-orange-400 mr-2" />
                    E-gift cards ($10/month)
                  </li>
                  <li className="flex items-center">
                    <CreditCard className="h-4 w-4 text-orange-400 mr-2" />
                    E-loyalty program ($15/month)
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-all ${selectedPlan === 'premium' ? 'ring-2 ring-coral' : ''}`}>
              <CardContent className="p-6" onClick={() => setSelectedPlan('premium')}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Crown className="text-coral mr-3" size={20} />
                    <h3 className="text-lg font-semibold text-gray-warm">Premium Plan</h3>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${selectedPlan === 'premium' ? 'bg-coral border-coral' : 'border-gray-300'}`} />
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-gray-warm">$49</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success mr-2" />
                    Unlimited ads
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success mr-2" />
                    E-gift cards included
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success mr-2" />
                    E-loyalty program included
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success mr-2" />
                    Priority support
                  </li>
                </ul>
              </CardContent>
            </Card>

            {selectedPlan === 'premium' && (
              <Card className="bg-coral text-white">
                <CardContent className="p-4 text-center">
                  <p className="text-sm">
                    You'll be redirected to setup your premium subscription after creating your business.
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
