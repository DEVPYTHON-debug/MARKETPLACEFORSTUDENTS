import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("student"), // student, provider, assistant
  isVerified: boolean("is_verified").default(false),
  isPremium: boolean("is_premium").default(false),
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).default("0.00"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  completedOrders: integer("completed_orders").default(0),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0.00"),
  
  // KYC Fields
  isKycVerified: boolean("is_kyc_verified").default(false),
  bvn: varchar("bvn"),
  nin: varchar("nin"),
  ninImageUrl: varchar("nin_image_url"),
  selfieImageUrl: varchar("selfie_image_url"),
  kycStatus: varchar("kyc_status").default("pending"), // pending, approved, rejected
  
  // Virtual Account
  virtualAccountNumber: varchar("virtual_account_number"),
  virtualAccountBank: varchar("virtual_account_bank"),
  
  // Manual authentication
  password: varchar("password"), // For manual login users
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: varchar("provider_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceType: varchar("price_type").notNull().default("fixed"), // fixed, hourly
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: integer("review_count").default(0),
  isActive: boolean("is_active").default(true),
  imageUrl: varchar("image_url"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gigs = pgTable("gigs", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: varchar("client_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  budget: varchar("budget").notNull(), // e.g., "₦5,000 - ₦8,000"
  deadline: timestamp("deadline").notNull(),
  status: varchar("status").notNull().default("open"), // open, in_progress, completed, cancelled
  bidCount: integer("bid_count").default(0),
  selectedBidId: uuid("selected_bid_id"),
  isActive: boolean("is_active").default(true),
  imageUrl: varchar("image_url"), // Optional image for the gig
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bids = pgTable("bids", {
  id: uuid("id").primaryKey().defaultRandom(),
  gigId: uuid("gig_id").notNull().references(() => gigs.id),
  bidderId: varchar("bidder_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  message: text("message").notNull(),
  deliveryTime: varchar("delivery_time").notNull(), // e.g., "3 days"
  status: varchar("status").notNull().default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceId: uuid("service_id").references(() => services.id),
  gigId: uuid("gig_id").references(() => gigs.id),
  bidId: uuid("bid_id").references(() => bids.id),
  clientId: varchar("client_id").notNull().references(() => users.id),
  providerId: varchar("provider_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"), // pending, in_progress, completed, cancelled
  paymentStatus: varchar("payment_status").notNull().default("pending"), // pending, paid, refunded
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  revieweeId: varchar("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  orderId: uuid("order_id").references(() => orders.id),
  type: varchar("type").notNull(), // credit, debit, withdrawal, deposit
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status").notNull().default("completed"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const chats = pgTable("chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id),
  gigId: uuid("gig_id").references(() => gigs.id),
  participants: text("participants").array().notNull(), // array of user IDs
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id").notNull().references(() => chats.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // bid_received, order_update, payment, etc.
  isRead: boolean("is_read").default(false),
  relatedId: varchar("related_id"), // gig_id, order_id, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  services: many(services),
  gigs: many(gigs),
  bids: many(bids),
  clientOrders: many(orders, { relationName: "clientOrders" }),
  providerOrders: many(orders, { relationName: "providerOrders" }),
  reviews: many(reviews),
  transactions: many(transactions),
  notifications: many(notifications),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  provider: one(users, {
    fields: [services.providerId],
    references: [users.id],
  }),
  orders: many(orders),
}));

export const gigsRelations = relations(gigs, ({ one, many }) => ({
  client: one(users, {
    fields: [gigs.clientId],
    references: [users.id],
  }),
  bids: many(bids),
  orders: many(orders),
  chats: many(chats),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  gig: one(gigs, {
    fields: [bids.gigId],
    references: [gigs.id],
  }),
  bidder: one(users, {
    fields: [bids.bidderId],
    references: [users.id],
  }),
  orders: one(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  service: one(services, {
    fields: [orders.serviceId],
    references: [services.id],
  }),
  gig: one(gigs, {
    fields: [orders.gigId],
    references: [gigs.id],
  }),
  bid: one(bids, {
    fields: [orders.bidId],
    references: [bids.id],
  }),
  client: one(users, {
    fields: [orders.clientId],
    references: [users.id],
    relationName: "clientOrders",
  }),
  provider: one(users, {
    fields: [orders.providerId],
    references: [users.id],
    relationName: "providerOrders",
  }),
  reviews: many(reviews),
  transactions: many(transactions),
  chats: many(chats),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
  reviewee: one(users, {
    fields: [reviews.revieweeId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [transactions.orderId],
    references: [orders.id],
  }),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  order: one(orders, {
    fields: [chats.orderId],
    references: [orders.id],
  }),
  gig: one(gigs, {
    fields: [chats.gigId],
    references: [gigs.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  reviewCount: true,
});

export const insertGigSchema = createInsertSchema(gigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  bidCount: true,
  selectedBidId: true,
}).extend({
  deadline: z.string().transform((str) => new Date(str)),
});

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
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
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertGig = z.infer<typeof insertGigSchema>;
export type Gig = typeof gigs.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type Bid = typeof bids.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type Chat = typeof chats.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
