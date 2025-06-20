import {
  users,
  services,
  gigs,
  bids,
  orders,
  reviews,
  transactions,
  chats,
  type User,
  type UpsertUser,
  type Service,
  type InsertService,
  type Gig,
  type InsertGig,
  type Bid,
  type InsertBid,
  type Order,
  type InsertOrder,
  type Review,
  type InsertReview,
  type Transaction,
  type InsertTransaction,
  type Chat,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, or, ilike, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  
  // Service operations
  getServices(filters?: { category?: string; search?: string; limit?: number }): Promise<Service[]>;
  getServiceById(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, updates: Partial<InsertService>): Promise<Service>;
  getServicesByProvider(providerId: string): Promise<Service[]>;
  
  // Gig operations
  getGigs(filters?: { category?: string; search?: string; status?: string; limit?: number }): Promise<Gig[]>;
  getGigById(id: string): Promise<Gig | undefined>;
  createGig(gig: InsertGig): Promise<Gig>;
  updateGig(id: string, updates: Partial<InsertGig>): Promise<Gig>;
  getGigsByClient(clientId: string): Promise<Gig[]>;
  
  // Bid operations
  getBidsByGig(gigId: string): Promise<Bid[]>;
  getBidsByBidder(bidderId: string): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;
  updateBid(id: string, updates: Partial<InsertBid>): Promise<Bid>;
  
  // Order operations
  getOrdersByUser(userId: string): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order>;
  
  // Review operations
  getReviewsByUser(userId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Transaction operations
  getTransactionsByUser(userId: string, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Chat operations
  getChatsByUser(userId: string): Promise<Chat[]>;
  
  // Analytics
  getUserStats(userId: string): Promise<{
    completedOrders: number;
    totalEarnings: string;
    averageRating: string;
    activeGigs: number;
  }>;
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

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Service operations
  async getServices(filters?: { category?: string; search?: string; limit?: number }): Promise<Service[]> {
    let whereConditions = [eq(services.isActive, true)];
    
    if (filters?.category) {
      whereConditions.push(eq(services.category, filters.category));
    }
    
    if (filters?.search) {
      whereConditions.push(
        or(
          ilike(services.title, `%${filters.search}%`),
          ilike(services.description, `%${filters.search}%`)
        )!
      );
    }
    
    let baseQuery = db.select().from(services).where(and(...whereConditions))
      .orderBy(desc(services.rating), desc(services.createdAt));
    
    if (filters?.limit) {
      return await baseQuery.limit(filters.limit);
    }
    
    return await baseQuery;
  }

  async getServiceById(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db
      .insert(services)
      .values(service)
      .returning();
    return newService;
  }

  async updateService(id: string, updates: Partial<InsertService>): Promise<Service> {
    const [service] = await db
      .update(services)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return service;
  }

  async getServicesByProvider(providerId: string): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(eq(services.providerId, providerId))
      .orderBy(desc(services.createdAt));
  }

  // Gig operations
  async getGigs(filters?: { category?: string; search?: string; status?: string; limit?: number }): Promise<Gig[]> {
    let whereConditions = [eq(gigs.isActive, true)];
    
    if (filters?.category) {
      whereConditions.push(eq(gigs.category, filters.category));
    }
    
    if (filters?.search) {
      whereConditions.push(
        or(
          ilike(gigs.title, `%${filters.search}%`),
          ilike(gigs.description, `%${filters.search}%`)
        )!
      );
    }
    
    if (filters?.status) {
      whereConditions.push(eq(gigs.status, filters.status));
    }
    
    let baseQuery = db.select().from(gigs).where(and(...whereConditions))
      .orderBy(desc(gigs.createdAt));
    
    if (filters?.limit) {
      return await baseQuery.limit(filters.limit);
    }
    
    return await baseQuery;
  }

  async getGigById(id: string): Promise<Gig | undefined> {
    const [gig] = await db.select().from(gigs).where(eq(gigs.id, id));
    return gig;
  }

  async createGig(gig: InsertGig): Promise<Gig> {
    const [newGig] = await db
      .insert(gigs)
      .values(gig)
      .returning();
    return newGig;
  }

  async updateGig(id: string, updates: Partial<InsertGig>): Promise<Gig> {
    const [gig] = await db
      .update(gigs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(gigs.id, id))
      .returning();
    return gig;
  }

  async getGigsByClient(clientId: string): Promise<Gig[]> {
    return await db
      .select()
      .from(gigs)
      .where(eq(gigs.clientId, clientId))
      .orderBy(desc(gigs.createdAt));
  }

  // Bid operations
  async getBidsByGig(gigId: string): Promise<Bid[]> {
    return await db
      .select()
      .from(bids)
      .where(eq(bids.gigId, gigId))
      .orderBy(desc(bids.createdAt));
  }

  async getBidsByBidder(bidderId: string): Promise<Bid[]> {
    return await db
      .select()
      .from(bids)
      .where(eq(bids.bidderId, bidderId))
      .orderBy(desc(bids.createdAt));
  }

  async createBid(bid: InsertBid): Promise<Bid> {
    const [newBid] = await db
      .insert(bids)
      .values(bid)
      .returning();
    
    // Update gig bid count
    await db
      .update(gigs)
      .set({ 
        bidCount: sql`${gigs.bidCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(gigs.id, bid.gigId));
    
    return newBid;
  }

  async updateBid(id: string, updates: Partial<InsertBid>): Promise<Bid> {
    const [bid] = await db
      .update(bids)
      .set(updates)
      .where(eq(bids.id, id))
      .returning();
    return bid;
  }

  // Order operations
  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(
        or(
          eq(orders.clientId, userId),
          eq(orders.providerId, userId)
        )
      )
      .orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Review operations
  async getReviewsByUser(userId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.revieweeId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    
    // Update user rating
    const userReviews = await this.getReviewsByUser(review.revieweeId);
    const averageRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    
    await db
      .update(users)
      .set({ 
        rating: averageRating.toFixed(2),
        updatedAt: new Date()
      })
      .where(eq(users.id, review.revieweeId));
    
    return newReview;
  }

  // Transaction operations
  async getTransactionsByUser(userId: string, limit = 10): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    
    // Update user wallet balance
    const amount = parseFloat(transaction.amount);
    const multiplier = transaction.type === 'credit' || transaction.type === 'deposit' ? 1 : -1;
    
    await db
      .update(users)
      .set({ 
        walletBalance: sql`${users.walletBalance} + ${amount * multiplier}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, transaction.userId));
    
    return newTransaction;
  }

  // Chat operations
  async getChatsByUser(userId: string): Promise<Chat[]> {
    return await db
      .select()
      .from(chats)
      .where(sql`${userId} = ANY(${chats.participants})`)
      .orderBy(desc(chats.lastMessageAt));
  }

  // Analytics
  async getUserStats(userId: string): Promise<{
    completedOrders: number;
    totalEarnings: string;
    averageRating: string;
    activeGigs: number;
  }> {
    const user = await this.getUser(userId);
    const activeGigs = await db
      .select({ count: sql<number>`count(*)` })
      .from(gigs)
      .where(and(eq(gigs.clientId, userId), eq(gigs.status, 'open')));

    return {
      completedOrders: user?.completedOrders || 0,
      totalEarnings: user?.totalEarnings || '0.00',
      averageRating: user?.rating || '0.00',
      activeGigs: activeGigs[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
