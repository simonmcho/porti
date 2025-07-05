import {
  users,
  businesses,
  businessSubscriptions,
  businessAds,
  loyaltyPrograms,
  userLoyaltyAccounts,
  giftCards,
  userFollows,
  transactions,
  type User,
  type UpsertUser,
  type Business,
  type InsertBusiness,
  type BusinessSubscription,
  type InsertBusinessSubscription,
  type BusinessAd,
  type InsertBusinessAd,
  type LoyaltyProgram,
  type InsertLoyaltyProgram,
  type GiftCard,
  type InsertGiftCard,
  type UserFollow,
  type InsertUserFollow,
  type Transaction,
  type InsertTransaction,
  type UserLoyaltyAccount,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, ilike, or } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;

  // Business operations
  createBusiness(business: InsertBusiness): Promise<Business>;
  getBusiness(id: number): Promise<Business | undefined>;
  getBusinessByOwnerId(ownerId: string): Promise<Business | undefined>;
  getBusinesses(params?: { search?: string; category?: string; limit?: number; offset?: number }): Promise<Business[]>;
  updateBusiness(id: number, updates: Partial<Business>): Promise<Business>;
  
  // Business subscription operations
  createBusinessSubscription(subscription: InsertBusinessSubscription): Promise<BusinessSubscription>;
  getBusinessSubscription(businessId: number, planType: string): Promise<BusinessSubscription | undefined>;
  updateBusinessSubscription(id: number, updates: Partial<BusinessSubscription>): Promise<BusinessSubscription>;
  
  // Business ads operations
  createBusinessAd(ad: InsertBusinessAd): Promise<BusinessAd>;
  getBusinessAds(businessId: number): Promise<BusinessAd[]>;
  updateBusinessAd(id: number, updates: Partial<BusinessAd>): Promise<BusinessAd>;
  
  // Loyalty program operations
  createLoyaltyProgram(program: InsertLoyaltyProgram): Promise<LoyaltyProgram>;
  getLoyaltyProgram(businessId: number): Promise<LoyaltyProgram | undefined>;
  updateLoyaltyProgram(id: number, updates: Partial<LoyaltyProgram>): Promise<LoyaltyProgram>;
  
  // User loyalty account operations
  getUserLoyaltyAccount(userId: string, businessId: number): Promise<UserLoyaltyAccount | undefined>;
  createUserLoyaltyAccount(userId: string, businessId: number): Promise<UserLoyaltyAccount>;
  updateUserLoyaltyPoints(userId: string, businessId: number, points: number): Promise<UserLoyaltyAccount>;
  getUserLoyaltyAccounts(userId: string): Promise<UserLoyaltyAccount[]>;
  
  // Gift card operations
  createGiftCard(giftCard: InsertGiftCard): Promise<GiftCard>;
  getGiftCard(id: string): Promise<GiftCard | undefined>;
  getGiftCardByCode(code: string): Promise<GiftCard | undefined>;
  getUserGiftCards(userId: string): Promise<GiftCard[]>;
  updateGiftCard(id: string, updates: Partial<GiftCard>): Promise<GiftCard>;
  
  // User follow operations
  followBusiness(userId: string, businessId: number): Promise<UserFollow>;
  unfollowBusiness(userId: string, businessId: number): Promise<void>;
  getUserFollows(userId: string): Promise<UserFollow[]>;
  isUserFollowing(userId: string, businessId: number): Promise<boolean>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  getBusinessTransactions(businessId: number): Promise<Transaction[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Business operations
  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db
      .insert(businesses)
      .values(business)
      .returning();
    return newBusiness;
  }

  async getBusiness(id: number): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business;
  }

  async getBusinessByOwnerId(ownerId: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.ownerId, ownerId));
    return business;
  }

  async getBusinesses(params?: { search?: string; category?: string; limit?: number; offset?: number }): Promise<Business[]> {
    let conditions = [eq(businesses.isActive, true)];
    
    if (params?.search) {
      conditions.push(
        or(
          ilike(businesses.name, `%${params.search}%`),
          ilike(businesses.description, `%${params.search}%`)
        )
      );
    }
    
    if (params?.category) {
      conditions.push(eq(businesses.category, params.category));
    }
    
    let query = db.select().from(businesses).where(and(...conditions)).orderBy(desc(businesses.createdAt));
    
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    
    if (params?.offset) {
      query = query.offset(params.offset);
    }
    
    return await query;
  }

  async updateBusiness(id: number, updates: Partial<Business>): Promise<Business> {
    const [business] = await db
      .update(businesses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(businesses.id, id))
      .returning();
    return business;
  }

  // Business subscription operations
  async createBusinessSubscription(subscription: InsertBusinessSubscription): Promise<BusinessSubscription> {
    const [newSubscription] = await db
      .insert(businessSubscriptions)
      .values(subscription)
      .returning();
    return newSubscription;
  }

  async getBusinessSubscription(businessId: number, planType: string): Promise<BusinessSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(businessSubscriptions)
      .where(
        and(
          eq(businessSubscriptions.businessId, businessId),
          eq(businessSubscriptions.planType, planType),
          eq(businessSubscriptions.status, "active")
        )
      );
    return subscription;
  }

  async updateBusinessSubscription(id: number, updates: Partial<BusinessSubscription>): Promise<BusinessSubscription> {
    const [subscription] = await db
      .update(businessSubscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(businessSubscriptions.id, id))
      .returning();
    return subscription;
  }

  // Business ads operations
  async createBusinessAd(ad: InsertBusinessAd): Promise<BusinessAd> {
    const [newAd] = await db
      .insert(businessAds)
      .values(ad)
      .returning();
    return newAd;
  }

  async getBusinessAds(businessId: number): Promise<BusinessAd[]> {
    return await db
      .select()
      .from(businessAds)
      .where(eq(businessAds.businessId, businessId))
      .orderBy(desc(businessAds.createdAt));
  }

  async updateBusinessAd(id: number, updates: Partial<BusinessAd>): Promise<BusinessAd> {
    const [ad] = await db
      .update(businessAds)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(businessAds.id, id))
      .returning();
    return ad;
  }

  // Loyalty program operations
  async createLoyaltyProgram(program: InsertLoyaltyProgram): Promise<LoyaltyProgram> {
    const [newProgram] = await db
      .insert(loyaltyPrograms)
      .values(program)
      .returning();
    return newProgram;
  }

  async getLoyaltyProgram(businessId: number): Promise<LoyaltyProgram | undefined> {
    const [program] = await db
      .select()
      .from(loyaltyPrograms)
      .where(eq(loyaltyPrograms.businessId, businessId));
    return program;
  }

  async updateLoyaltyProgram(id: number, updates: Partial<LoyaltyProgram>): Promise<LoyaltyProgram> {
    const [program] = await db
      .update(loyaltyPrograms)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(loyaltyPrograms.id, id))
      .returning();
    return program;
  }

  // User loyalty account operations
  async getUserLoyaltyAccount(userId: string, businessId: number): Promise<UserLoyaltyAccount | undefined> {
    const [account] = await db
      .select()
      .from(userLoyaltyAccounts)
      .where(
        and(
          eq(userLoyaltyAccounts.userId, userId),
          eq(userLoyaltyAccounts.businessId, businessId)
        )
      );
    return account;
  }

  async createUserLoyaltyAccount(userId: string, businessId: number): Promise<UserLoyaltyAccount> {
    const [account] = await db
      .insert(userLoyaltyAccounts)
      .values({
        userId,
        businessId,
        points: 0,
        totalPointsEarned: 0,
      })
      .returning();
    return account;
  }

  async updateUserLoyaltyPoints(userId: string, businessId: number, points: number): Promise<UserLoyaltyAccount> {
    const [account] = await db
      .update(userLoyaltyAccounts)
      .set({
        points: sql`${userLoyaltyAccounts.points} + ${points}`,
        totalPointsEarned: sql`${userLoyaltyAccounts.totalPointsEarned} + ${points}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userLoyaltyAccounts.userId, userId),
          eq(userLoyaltyAccounts.businessId, businessId)
        )
      )
      .returning();
    return account;
  }

  async getUserLoyaltyAccounts(userId: string): Promise<UserLoyaltyAccount[]> {
    return await db
      .select()
      .from(userLoyaltyAccounts)
      .where(eq(userLoyaltyAccounts.userId, userId));
  }

  // Gift card operations
  async createGiftCard(giftCard: InsertGiftCard): Promise<GiftCard> {
    const code = nanoid(12).toUpperCase();
    const [newGiftCard] = await db
      .insert(giftCards)
      .values({
        ...giftCard,
        code,
        balance: giftCard.amount,
        status: "active",
      })
      .returning();
    return newGiftCard;
  }

  async getGiftCard(id: string): Promise<GiftCard | undefined> {
    const [giftCard] = await db.select().from(giftCards).where(eq(giftCards.id, id));
    return giftCard;
  }

  async getGiftCardByCode(code: string): Promise<GiftCard | undefined> {
    const [giftCard] = await db.select().from(giftCards).where(eq(giftCards.code, code));
    return giftCard;
  }

  async getUserGiftCards(userId: string): Promise<GiftCard[]> {
    return await db
      .select()
      .from(giftCards)
      .where(eq(giftCards.purchasedBy, userId))
      .orderBy(desc(giftCards.createdAt));
  }

  async updateGiftCard(id: string, updates: Partial<GiftCard>): Promise<GiftCard> {
    const [giftCard] = await db
      .update(giftCards)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(giftCards.id, id))
      .returning();
    return giftCard;
  }

  // User follow operations
  async followBusiness(userId: string, businessId: number): Promise<UserFollow> {
    const [follow] = await db
      .insert(userFollows)
      .values({ userId, businessId })
      .returning();
    
    // Update follower count
    await db
      .update(businesses)
      .set({ followerCount: sql`${businesses.followerCount} + 1` })
      .where(eq(businesses.id, businessId));
    
    return follow;
  }

  async unfollowBusiness(userId: string, businessId: number): Promise<void> {
    await db
      .delete(userFollows)
      .where(
        and(
          eq(userFollows.userId, userId),
          eq(userFollows.businessId, businessId)
        )
      );
    
    // Update follower count
    await db
      .update(businesses)
      .set({ followerCount: sql`${businesses.followerCount} - 1` })
      .where(eq(businesses.id, businessId));
  }

  async getUserFollows(userId: string): Promise<UserFollow[]> {
    return await db
      .select()
      .from(userFollows)
      .where(eq(userFollows.userId, userId));
  }

  async isUserFollowing(userId: string, businessId: number): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(userFollows)
      .where(
        and(
          eq(userFollows.userId, userId),
          eq(userFollows.businessId, businessId)
        )
      );
    return !!follow;
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async getBusinessTransactions(businessId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.businessId, businessId))
      .orderBy(desc(transactions.createdAt));
  }
}

export const storage = new DatabaseStorage();
