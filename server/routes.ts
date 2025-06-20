import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertServiceSchema,
  insertGigSchema,
  insertBidSchema,
  insertOrderSchema,
  insertReviewSchema,
  insertTransactionSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Service routes
  app.get('/api/services', async (req, res) => {
    try {
      const { category, search, limit } = req.query;
      const services = await storage.getServices({
        category: category as string,
        search: search as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get('/api/services/:id', async (req, res) => {
    try {
      const service = await storage.getServiceById(req.params.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.post('/api/services', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const serviceData = insertServiceSchema.parse({
        ...req.body,
        providerId: userId,
      });
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          details: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.get('/api/my-services', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const services = await storage.getServicesByProvider(userId);
      res.json(services);
    } catch (error) {
      console.error("Error fetching user services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Gig routes
  app.get('/api/gigs', async (req, res) => {
    try {
      const { category, search, status, limit } = req.query;
      const gigs = await storage.getGigs({
        category: category as string,
        search: search as string,
        status: status as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(gigs);
    } catch (error) {
      console.error("Error fetching gigs:", error);
      res.status(500).json({ message: "Failed to fetch gigs" });
    }
  });

  app.get('/api/gigs/:id', async (req, res) => {
    try {
      const gig = await storage.getGigById(req.params.id);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }
      res.json(gig);
    } catch (error) {
      console.error("Error fetching gig:", error);
      res.status(500).json({ message: "Failed to fetch gig" });
    }
  });

  app.post('/api/gigs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const gigData = insertGigSchema.parse({
        ...req.body,
        clientId: userId,
      });
      const gig = await storage.createGig(gigData);
      res.status(201).json(gig);
    } catch (error) {
      console.error("Error creating gig:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          details: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create gig" });
    }
  });

  app.get('/api/my-gigs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const gigs = await storage.getGigsByClient(userId);
      res.json(gigs);
    } catch (error) {
      console.error("Error fetching user gigs:", error);
      res.status(500).json({ message: "Failed to fetch gigs" });
    }
  });

  // Bid routes
  app.get('/api/gigs/:gigId/bids', isAuthenticated, async (req, res) => {
    try {
      const bids = await storage.getBidsByGig(req.params.gigId);
      res.json(bids);
    } catch (error) {
      console.error("Error fetching bids:", error);
      res.status(500).json({ message: "Failed to fetch bids" });
    }
  });

  app.post('/api/gigs/:gigId/bids', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bidData = insertBidSchema.parse({
        ...req.body,
        gigId: req.params.gigId,
        bidderId: userId,
      });
      const bid = await storage.createBid(bidData);
      res.status(201).json(bid);
    } catch (error) {
      console.error("Error creating bid:", error);
      res.status(500).json({ message: "Failed to create bid" });
    }
  });

  app.get('/api/my-bids', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bids = await storage.getBidsByBidder(userId);
      res.json(bids);
    } catch (error) {
      console.error("Error fetching user bids:", error);
      res.status(500).json({ message: "Failed to fetch bids" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrdersByUser(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        clientId: userId,
      });
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Review routes
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        reviewerId: userId,
      });
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit } = req.query;
      const transactions = await storage.getTransactionsByUser(
        userId,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId,
      });
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // User stats
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Update user profile
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, role } = req.body;
      
      const updatedUser = await storage.updateUser(userId, {
        firstName,
        lastName,
        role
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Add money to wallet
  app.post('/api/wallet/add-money', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, description = "Wallet top-up" } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Create credit transaction
      const transaction = await storage.createTransaction({
        userId,
        type: "deposit",
        amount: parseFloat(amount).toString(),
        description,
        status: "completed"
      });
      
      res.json({ 
        success: true, 
        transaction,
        message: "Money added successfully" 
      });
    } catch (error) {
      console.error("Error adding money:", error);
      res.status(500).json({ message: "Failed to add money" });
    }
  });

  // Withdraw money from wallet
  app.post('/api/wallet/withdraw', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, description = "Wallet withdrawal" } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      const user = await storage.getUser(userId);
      const currentBalance = parseFloat(user?.walletBalance || '0');
      
      if (currentBalance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Create debit transaction
      const transaction = await storage.createTransaction({
        userId,
        type: "withdrawal",
        amount: parseFloat(amount).toString(),
        description,
        status: "completed"
      });
      
      res.json({ 
        success: true, 
        transaction,
        message: "Money withdrawn successfully" 
      });
    } catch (error) {
      console.error("Error withdrawing money:", error);
      res.status(500).json({ message: "Failed to withdraw money" });
    }
  });

  // Chat routes
  app.get('/api/chats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chats = await storage.getChatsByUser(userId);
      res.json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  app.get('/api/chats/:chatId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { chatId } = req.params;
      
      // Verify user is participant in this chat
      const chat = await storage.getChatsByUser(userId);
      const userChat = chat.find(c => c.id === chatId);
      
      if (!userChat) {
        return res.status(403).json({ message: "Access denied to this chat" });
      }
      
      const messages = await storage.getMessagesByChat(chatId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/chats/:chatId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { chatId } = req.params;
      const { content } = req.body;
      
      if (!content?.trim()) {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      // Verify user is participant in this chat
      const userChats = await storage.getChatsByUser(userId);
      const userChat = userChats.find(c => c.id === chatId);
      
      if (!userChat) {
        return res.status(403).json({ message: "Access denied to this chat" });
      }
      
      const message = await storage.createMessage({
        chatId,
        senderId: userId,
        content: content.trim()
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
