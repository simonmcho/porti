import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
// import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertBusinessSchema,
  insertBusinessAdSchema,
  insertLoyaltyProgramSchema,
  insertGiftCardSchema,
  insertTransactionSchema,
} from "@shared/schema";
import { z } from "zod";

const isAuthenticated: RequestHandler = async (req, res, next) => {
  return next();
};

// Temporarily disable Stripe check until keys are provided
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-11-20.acacia",
    })
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  // await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Business routes
  app.post("/api/businesses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const businessData = insertBusinessSchema.parse({
        ...req.body,
        ownerId: userId,
      });

      const business = await storage.createBusiness(businessData);
      res.json(business);
    } catch (error: any) {
      console.error("Error creating business:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/businesses", async (req, res) => {
    try {
      const { search, category, limit, offset } = req.query;
      const businesses = await storage.getBusinesses({
        search: search as string,
        category: category as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(businesses);
    } catch (error: any) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  app.get("/api/businesses/:id", async (req, res) => {
    try {
      const businessId = parseInt(req.params.id);
      const business = await storage.getBusiness(businessId);

      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      res.json(business);
    } catch (error: any) {
      console.error("Error fetching business:", error);
      res.status(500).json({ message: "Failed to fetch business" });
    }
  });

  app.get("/api/my-business", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const business = await storage.getBusinessByOwnerId(userId);
      res.json(business);
    } catch (error: any) {
      console.error("Error fetching user's business:", error);
      res.status(500).json({ message: "Failed to fetch business" });
    }
  });

  // Business ads routes
  app.post(
    "/api/businesses/:id/ads",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const businessId = parseInt(req.params.id);
        const userId = req.user.claims.sub;

        // Check if user owns the business
        const business = await storage.getBusiness(businessId);
        if (!business || business.ownerId !== userId) {
          return res.status(403).json({ message: "Unauthorized" });
        }

        const adData = insertBusinessAdSchema.parse({
          ...req.body,
          businessId,
        });
        const ad = await storage.createBusinessAd(adData);
        res.json(ad);
      } catch (error: any) {
        console.error("Error creating business ad:", error);
        res.status(400).json({ message: error.message });
      }
    }
  );

  app.get("/api/businesses/:id/ads", async (req, res) => {
    try {
      const businessId = parseInt(req.params.id);
      const ads = await storage.getBusinessAds(businessId);
      res.json(ads);
    } catch (error: any) {
      console.error("Error fetching business ads:", error);
      res.status(500).json({ message: "Failed to fetch ads" });
    }
  });

  // Loyalty program routes
  app.post(
    "/api/businesses/:id/loyalty-program",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const businessId = parseInt(req.params.id);
        const userId = req.user.claims.sub;

        // Check if user owns the business
        const business = await storage.getBusiness(businessId);
        if (!business || business.ownerId !== userId) {
          return res.status(403).json({ message: "Unauthorized" });
        }

        const programData = insertLoyaltyProgramSchema.parse({
          ...req.body,
          businessId,
        });
        const program = await storage.createLoyaltyProgram(programData);
        res.json(program);
      } catch (error: any) {
        console.error("Error creating loyalty program:", error);
        res.status(400).json({ message: error.message });
      }
    }
  );

  app.get("/api/businesses/:id/loyalty-program", async (req, res) => {
    try {
      const businessId = parseInt(req.params.id);
      const program = await storage.getLoyaltyProgram(businessId);
      res.json(program);
    } catch (error: any) {
      console.error("Error fetching loyalty program:", error);
      res.status(500).json({ message: "Failed to fetch loyalty program" });
    }
  });

  // User loyalty account routes
  app.post(
    "/api/businesses/:id/join-loyalty",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const businessId = parseInt(req.params.id);
        const userId = req.user.claims.sub;

        // Check if user already has an account
        const existingAccount = await storage.getUserLoyaltyAccount(
          userId,
          businessId
        );
        if (existingAccount) {
          return res.json(existingAccount);
        }

        const account = await storage.createUserLoyaltyAccount(
          userId,
          businessId
        );
        res.json(account);
      } catch (error: any) {
        console.error("Error joining loyalty program:", error);
        res.status(400).json({ message: error.message });
      }
    }
  );

  app.get(
    "/api/user/loyalty-accounts",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const accounts = await storage.getUserLoyaltyAccounts(userId);
        res.json(accounts);
      } catch (error: any) {
        console.error("Error fetching loyalty accounts:", error);
        res.status(500).json({ message: "Failed to fetch loyalty accounts" });
      }
    }
  );

  // Gift card routes
  app.post(
    "/api/businesses/:id/gift-cards",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const businessId = parseInt(req.params.id);
        const userId = req.user.claims.sub;

        const giftCardData = insertGiftCardSchema.parse({
          ...req.body,
          businessId,
          purchasedBy: userId,
        });

        const giftCard = await storage.createGiftCard(giftCardData);
        res.json(giftCard);
      } catch (error: any) {
        console.error("Error creating gift card:", error);
        res.status(400).json({ message: error.message });
      }
    }
  );

  app.get("/api/user/gift-cards", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const giftCards = await storage.getUserGiftCards(userId);
      res.json(giftCards);
    } catch (error: any) {
      console.error("Error fetching gift cards:", error);
      res.status(500).json({ message: "Failed to fetch gift cards" });
    }
  });

  // User follow routes
  app.post(
    "/api/businesses/:id/follow",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const businessId = parseInt(req.params.id);
        const userId = req.user.claims.sub;

        const isFollowing = await storage.isUserFollowing(userId, businessId);
        if (isFollowing) {
          return res
            .status(400)
            .json({ message: "Already following this business" });
        }

        const follow = await storage.followBusiness(userId, businessId);
        res.json(follow);
      } catch (error: any) {
        console.error("Error following business:", error);
        res.status(400).json({ message: error.message });
      }
    }
  );

  app.delete(
    "/api/businesses/:id/follow",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const businessId = parseInt(req.params.id);
        const userId = req.user.claims.sub;

        await storage.unfollowBusiness(userId, businessId);
        res.json({ message: "Unfollowed successfully" });
      } catch (error: any) {
        console.error("Error unfollowing business:", error);
        res.status(400).json({ message: error.message });
      }
    }
  );

  app.get("/api/user/follows", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const follows = await storage.getUserFollows(userId);
      res.json(follows);
    } catch (error: any) {
      console.error("Error fetching follows:", error);
      res.status(500).json({ message: "Failed to fetch follows" });
    }
  });

  app.get(
    "/api/businesses/:id/is-following",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const businessId = parseInt(req.params.id);
        const userId = req.user.claims.sub;

        const isFollowing = await storage.isUserFollowing(userId, businessId);
        res.json({ isFollowing });
      } catch (error: any) {
        console.error("Error checking follow status:", error);
        res.status(500).json({ message: "Failed to check follow status" });
      }
    }
  );

  // Stripe payment routes
  app.post(
    "/api/create-payment-intent",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const { amount } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: "usd",
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        res
          .status(500)
          .json({ message: "Error creating payment intent: " + error.message });
      }
    }
  );

  app.post(
    "/api/get-or-create-subscription",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { planType } = req.body;

        let user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        if (user.stripeSubscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(
            user.stripeSubscriptionId
          );

          res.json({
            subscriptionId: subscription.id,
            clientSecret: (subscription.latest_invoice as any)?.payment_intent
              ?.client_secret,
          });
          return;
        }

        if (!user.email) {
          return res.status(400).json({ message: "No user email on file" });
        }

        const customer = await stripe.customers.create({
          email: user.email,
          name:
            user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.email,
        });

        // Define price IDs for different plan types
        const priceIds = {
          premium: process.env.STRIPE_PREMIUM_PRICE_ID,
          giftcards: process.env.STRIPE_GIFTCARDS_PRICE_ID,
          loyalty: process.env.STRIPE_LOYALTY_PRICE_ID,
        };

        const priceId = priceIds[planType as keyof typeof priceIds];
        if (!priceId) {
          return res.status(400).json({ message: "Invalid plan type" });
        }

        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: priceId }],
          payment_behavior: "default_incomplete",
          expand: ["latest_invoice.payment_intent"],
        });

        user = await storage.updateUserStripeInfo(
          userId,
          customer.id,
          subscription.id
        );

        res.json({
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent
            ?.client_secret,
        });
      } catch (error: any) {
        console.error("Error creating subscription:", error);
        res.status(400).json({ message: error.message });
      }
    }
  );

  // Transaction routes
  app.get("/api/user/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
