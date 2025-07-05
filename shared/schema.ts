import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
  decimal,
  uuid,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  address: text("address"),
  phone: varchar("phone"),
  email: varchar("email"),
  website: varchar("website"),
  imageUrl: varchar("image_url"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  reviewCount: integer("review_count").default(0),
  followerCount: integer("follower_count").default(0),
  planType: varchar("plan_type").notNull().default("basic"), // 'basic' or 'premium'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const businessSubscriptions = pgTable("business_subscriptions", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  planType: varchar("plan_type").notNull(), // 'premium', 'giftcards', 'loyalty'
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  status: varchar("status").notNull().default("active"), // 'active', 'canceled', 'past_due'
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const businessAds = pgTable("business_ads", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  title: varchar("title").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const loyaltyPrograms = pgTable("loyalty_programs", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  name: varchar("name").notNull(),
  description: text("description"),
  pointsPerDollar: decimal("points_per_dollar", { precision: 3, scale: 2 }).default("1.00"),
  rewardThreshold: integer("reward_threshold").default(100),
  rewardDescription: text("reward_description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userLoyaltyAccounts = pgTable("user_loyalty_accounts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  points: integer("points").default(0),
  totalPointsEarned: integer("total_points_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.businessId),
]);

export const giftCards = pgTable("gift_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  purchasedBy: varchar("purchased_by").notNull().references(() => users.id),
  recipientEmail: varchar("recipient_email"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull(),
  code: varchar("code").notNull().unique(),
  message: text("message"),
  status: varchar("status").notNull().default("active"), // 'active', 'redeemed', 'expired'
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userFollows = pgTable("user_follows", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.businessId),
]);

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessId: integer("business_id").references(() => businesses.id),
  type: varchar("type").notNull(), // 'giftcard_purchase', 'giftcard_redemption', 'loyalty_purchase'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  giftCardId: uuid("gift_card_id").references(() => giftCards.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedBusinesses: many(businesses),
  loyaltyAccounts: many(userLoyaltyAccounts),
  giftCardsPurchased: many(giftCards),
  follows: many(userFollows),
  transactions: many(transactions),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  owner: one(users, {
    fields: [businesses.ownerId],
    references: [users.id],
  }),
  subscriptions: many(businessSubscriptions),
  ads: many(businessAds),
  loyaltyProgram: one(loyaltyPrograms),
  loyaltyAccounts: many(userLoyaltyAccounts),
  giftCards: many(giftCards),
  followers: many(userFollows),
  transactions: many(transactions),
}));

export const businessSubscriptionsRelations = relations(businessSubscriptions, ({ one }) => ({
  business: one(businesses, {
    fields: [businessSubscriptions.businessId],
    references: [businesses.id],
  }),
}));

export const businessAdsRelations = relations(businessAds, ({ one }) => ({
  business: one(businesses, {
    fields: [businessAds.businessId],
    references: [businesses.id],
  }),
}));

export const loyaltyProgramsRelations = relations(loyaltyPrograms, ({ one, many }) => ({
  business: one(businesses, {
    fields: [loyaltyPrograms.businessId],
    references: [businesses.id],
  }),
  userAccounts: many(userLoyaltyAccounts),
}));

export const userLoyaltyAccountsRelations = relations(userLoyaltyAccounts, ({ one }) => ({
  user: one(users, {
    fields: [userLoyaltyAccounts.userId],
    references: [users.id],
  }),
  business: one(businesses, {
    fields: [userLoyaltyAccounts.businessId],
    references: [businesses.id],
  }),
}));

export const giftCardsRelations = relations(giftCards, ({ one }) => ({
  business: one(businesses, {
    fields: [giftCards.businessId],
    references: [businesses.id],
  }),
  purchaser: one(users, {
    fields: [giftCards.purchasedBy],
    references: [users.id],
  }),
}));

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  user: one(users, {
    fields: [userFollows.userId],
    references: [users.id],
  }),
  business: one(businesses, {
    fields: [userFollows.businessId],
    references: [businesses.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  business: one(businesses, {
    fields: [transactions.businessId],
    references: [businesses.id],
  }),
  giftCard: one(giftCards, {
    fields: [transactions.giftCardId],
    references: [giftCards.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  followerCount: true,
  rating: true,
  reviewCount: true,
});

export const insertBusinessSubscriptionSchema = createInsertSchema(businessSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBusinessAdSchema = createInsertSchema(businessAds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLoyaltyProgramSchema = createInsertSchema(loyaltyPrograms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGiftCardSchema = createInsertSchema(giftCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  balance: true,
  code: true,
  status: true,
});

export const insertUserFollowSchema = createInsertSchema(userFollows).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;

export type InsertBusinessSubscription = z.infer<typeof insertBusinessSubscriptionSchema>;
export type BusinessSubscription = typeof businessSubscriptions.$inferSelect;

export type InsertBusinessAd = z.infer<typeof insertBusinessAdSchema>;
export type BusinessAd = typeof businessAds.$inferSelect;

export type InsertLoyaltyProgram = z.infer<typeof insertLoyaltyProgramSchema>;
export type LoyaltyProgram = typeof loyaltyPrograms.$inferSelect;

export type InsertGiftCard = z.infer<typeof insertGiftCardSchema>;
export type GiftCard = typeof giftCards.$inferSelect;

export type InsertUserFollow = z.infer<typeof insertUserFollowSchema>;
export type UserFollow = typeof userFollows.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type UserLoyaltyAccount = typeof userLoyaltyAccounts.$inferSelect;
