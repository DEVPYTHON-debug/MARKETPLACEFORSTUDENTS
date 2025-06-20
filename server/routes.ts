import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { upload, getFileUrl } from "./upload";
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
  
  // Serve static files (uploaded images)
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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

  app.post('/api/services', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const imageUrl = req.file ? getFileUrl(req.file.filename) : null;
      
      // Parse tags if it's a JSON string
      let tags = [];
      if (req.body.tags) {
        try {
          tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
        } catch (e) {
          tags = [];
        }
      }
      
      const serviceData = insertServiceSchema.parse({
        ...req.body,
        providerId: userId,
        imageUrl,
        tags,
      });
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error: any) {
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

  app.patch('/api/services/:id', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const serviceId = req.params.id;
      
      // Check if the user owns this service
      const existingService = await storage.getServiceById(serviceId);
      if (!existingService || existingService.providerId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const imageUrl = req.file ? getFileUrl(req.file.filename) : undefined;
      
      // Parse tags if it's a JSON string
      let tags = req.body.tags;
      if (tags && typeof tags === 'string') {
        try {
          tags = JSON.parse(tags);
        } catch (e) {
          tags = [];
        }
      }
      
      const updateData = {
        ...req.body,
        ...(imageUrl && { imageUrl }),
        ...(tags && { tags }),
      };
      
      const service = await storage.updateService(serviceId, updateData);
      res.json(service);
    } catch (error: any) {
      console.error("Error updating service:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          details: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete('/api/services/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const serviceId = req.params.id;
      
      // Check if the user owns this service
      const existingService = await storage.getServiceById(serviceId);
      if (!existingService || existingService.providerId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteService(serviceId);
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
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

  app.post('/api/gigs', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const imageUrl = req.file ? getFileUrl(req.file.filename) : null;
      
      const gigData = insertGigSchema.parse({
        ...req.body,
        clientId: userId,
        imageUrl,
      });
      const gig = await storage.createGig(gigData);
      res.status(201).json(gig);
    } catch (error: any) {
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

  app.patch('/api/gigs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const gigId = req.params.id;
      
      // Check if the user owns this gig
      const existingGig = await storage.getGigById(gigId);
      if (!existingGig || existingGig.clientId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const gig = await storage.updateGig(gigId, req.body);
      res.json(gig);
    } catch (error: any) {
      console.error("Error updating gig:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Validation error", 
          details: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update gig" });
    }
  });

  app.delete('/api/gigs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const gigId = req.params.id;
      
      // Check if the user owns this gig
      const existingGig = await storage.getGigById(gigId);
      if (!existingGig || existingGig.clientId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteGig(gigId);
      res.json({ message: "Gig deleted successfully" });
    } catch (error) {
      console.error("Error deleting gig:", error);
      res.status(500).json({ message: "Failed to delete gig" });
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
  app.put('/api/user/profile', isAuthenticated, upload.single('profileImage'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, role } = req.body;
      const profileImageUrl = req.file ? getFileUrl(req.file.filename) : undefined;
      
      if (!firstName || !lastName) {
        return res.status(400).json({ message: "First name and last name are required" });
      }
      
      const updateData: any = {
        firstName,
        lastName,
        role
      };
      
      if (profileImageUrl) {
        updateData.profileImageUrl = profileImageUrl;
      }
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
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

  // Manual authentication routes
  app.post('/api/auth/manual-register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Create user with hashed password (in production, use proper password hashing)
      const userId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userData = {
        id: userId,
        email,
        firstName,
        lastName,
        role,
        password,
      };
      
      const user = await storage.upsertUser(userData);
      res.status(201).json({ message: "User created successfully", user });
    } catch (error: any) {
      console.error("Manual registration error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post('/api/auth/manual-login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In production, properly verify hashed password
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create session manually (simplified)
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          return res.status(500).json({ message: "Session error" });
        }
        res.json({ message: "Login successful", user });
      });
    } catch (error: any) {
      console.error("Manual login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Notifications routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch('/api/notifications/mark-all-read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // KYC routes
  app.get('/api/kyc', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const kycData = await storage.getKycData(userId);
      res.json(kycData);
    } catch (error) {
      console.error("Error fetching KYC data:", error);
      res.status(500).json({ message: "Failed to fetch KYC data" });
    }
  });

  app.post('/api/kyc/submit', isAuthenticated, upload.fields([
    { name: 'ninImage', maxCount: 1 },
    { name: 'selfieImage', maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bvn, nin } = req.body;
      const files = req.files;
      
      const kycData = {
        bvn,
        nin,
        ninImageUrl: files?.ninImage?.[0] ? getFileUrl(files.ninImage[0].filename) : null,
        selfieImageUrl: files?.selfieImage?.[0] ? getFileUrl(files.selfieImage[0].filename) : null,
      };
      
      const result = await storage.submitKyc(userId, kycData);
      res.json(result);
    } catch (error) {
      console.error("Error submitting KYC:", error);
      res.status(500).json({ message: "Failed to submit KYC" });
    }
  });

  // Virtual account routes
  app.get('/api/virtual-account', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const virtualAccount = await storage.getVirtualAccount(userId);
      res.json(virtualAccount);
    } catch (error) {
      console.error("Error fetching virtual account:", error);
      res.status(500).json({ message: "Failed to fetch virtual account" });
    }
  });

  app.post('/api/virtual-account/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const virtualAccount = await storage.generateVirtualAccount(userId);
      res.json(virtualAccount);
    } catch (error) {
      console.error("Error generating virtual account:", error);
      res.status(500).json({ message: "Failed to generate virtual account" });
    }
  });

  // Logout route
  app.get('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.redirect('/');
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
