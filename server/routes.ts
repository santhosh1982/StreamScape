import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertChannelSchema, insertVideoSchema, insertCategorySchema } from "@shared/schema";
import multer from "multer";
import path from "path";

const upload = multer({ dest: "uploads/" });

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

  // Categories routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Channels routes
  app.get('/api/channels', async (req, res) => {
    try {
      const userId = req.query.owner as string;
      if (userId) {
        const channels = await storage.getChannelsByOwner(userId);
        res.json(channels);
      } else {
        res.status(400).json({ message: "Owner ID required" });
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      res.status(500).json({ message: "Failed to fetch channels" });
    }
  });

  app.get('/api/channels/:id', async (req, res) => {
    try {
      const channel = await storage.getChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      res.json(channel);
    } catch (error) {
      console.error("Error fetching channel:", error);
      res.status(500).json({ message: "Failed to fetch channel" });
    }
  });

  app.post('/api/channels', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const channelData = insertChannelSchema.parse({
        ...req.body,
        ownerUserId: userId,
      });
      const channel = await storage.createChannel(channelData);
      res.status(201).json(channel);
    } catch (error) {
      console.error("Error creating channel:", error);
      res.status(500).json({ message: "Failed to create channel" });
    }
  });

  app.patch('/api/channels/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const channel = await storage.getChannel(req.params.id);
      
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      
      if (channel.ownerUserId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updates = insertChannelSchema.partial().parse(req.body);
      const updatedChannel = await storage.updateChannel(req.params.id, updates);
      res.json(updatedChannel);
    } catch (error) {
      console.error("Error updating channel:", error);
      res.status(500).json({ message: "Failed to update channel" });
    }
  });

  app.delete('/api/channels/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const channel = await storage.getChannel(req.params.id);
      
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      
      if (channel.ownerUserId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deleteChannel(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting channel:", error);
      res.status(500).json({ message: "Failed to delete channel" });
    }
  });

  // Videos routes
  app.get('/api/videos', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const channelId = req.query.channelId as string;
      const categoryId = req.query.categoryId as string;
      const search = req.query.search as string;

      let videos;
      if (channelId) {
        videos = await storage.getVideosByChannel(channelId, limit, offset);
      } else if (categoryId) {
        videos = await storage.getVideosByCategory(categoryId, limit, offset);
      } else if (search) {
        videos = await storage.searchVideos(search, limit, offset);
      } else {
        videos = await storage.getVideos(limit, offset);
      }

      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.get('/api/videos/:id', async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Increment view count
      await storage.incrementViewCount(req.params.id);
      
      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  app.post('/api/videos', isAuthenticated, upload.single('video'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      if (!req.file) {
        return res.status(400).json({ message: "Video file required" });
      }

      const videoData = insertVideoSchema.parse({
        ...req.body,
        videoUrl: req.file.path, // This would be processed and stored properly in production
        tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : [],
      });

      // Verify channel ownership
      const channel = await storage.getChannel(videoData.channelId);
      if (!channel || channel.ownerUserId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const video = await storage.createVideo(videoData);
      res.status(201).json(video);
    } catch (error) {
      console.error("Error uploading video:", error);
      res.status(500).json({ message: "Failed to upload video" });
    }
  });

  app.patch('/api/videos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const video = await storage.getVideo(req.params.id);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Verify channel ownership
      const channel = await storage.getChannel(video.channelId);
      if (!channel || channel.ownerUserId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updates = insertVideoSchema.partial().parse(req.body);
      if (updates.tags && typeof updates.tags === 'string') {
        updates.tags = (updates.tags as string).split(',').map((tag: string) => tag.trim());
      }

      const updatedVideo = await storage.updateVideo(req.params.id, updates);
      res.json(updatedVideo);
    } catch (error) {
      console.error("Error updating video:", error);
      res.status(500).json({ message: "Failed to update video" });
    }
  });

  app.delete('/api/videos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const video = await storage.getVideo(req.params.id);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Verify channel ownership
      const channel = await storage.getChannel(video.channelId);
      if (!channel || channel.ownerUserId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deleteVideo(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // Subscriptions routes
  app.post('/api/subscriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { channelId } = req.body;

      if (!channelId) {
        return res.status(400).json({ message: "Channel ID required" });
      }

      const subscription = await storage.subscribe({ userId, channelId });
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error subscribing:", error);
      res.status(500).json({ message: "Failed to subscribe" });
    }
  });

  app.delete('/api/subscriptions/:channelId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const channelId = req.params.channelId;

      await storage.unsubscribe(userId, channelId);
      res.status(204).send();
    } catch (error) {
      console.error("Error unsubscribing:", error);
      res.status(500).json({ message: "Failed to unsubscribe" });
    }
  });

  app.get('/api/subscriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscriptions = await storage.getUserSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.get('/api/subscriptions/:channelId/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const channelId = req.params.channelId;
      const isSubscribed = await storage.isSubscribed(userId, channelId);
      res.json({ isSubscribed });
    } catch (error) {
      console.error("Error checking subscription status:", error);
      res.status(500).json({ message: "Failed to check subscription status" });
    }
  });

  // Watch history routes
  app.post('/api/watch-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { videoId, watchTime } = req.body;

      const watchHistory = await storage.addToWatchHistory({
        userId,
        videoId,
        watchTime: watchTime || 0,
      });

      res.json(watchHistory);
    } catch (error) {
      console.error("Error adding to watch history:", error);
      res.status(500).json({ message: "Failed to add to watch history" });
    }
  });

  app.get('/api/watch-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const history = await storage.getUserWatchHistory(userId, limit, offset);
      res.json(history);
    } catch (error) {
      console.error("Error fetching watch history:", error);
      res.status(500).json({ message: "Failed to fetch watch history" });
    }
  });

  // Video likes routes
  app.post('/api/videos/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videoId = req.params.id;
      const { isLike } = req.body;

      const like = await storage.likeVideo({ userId, videoId, isLike });
      res.json(like);
    } catch (error) {
      console.error("Error liking video:", error);
      res.status(500).json({ message: "Failed to like video" });
    }
  });

  app.delete('/api/videos/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videoId = req.params.id;

      await storage.removeLike(userId, videoId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing like:", error);
      res.status(500).json({ message: "Failed to remove like" });
    }
  });

  app.get('/api/videos/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videoId = req.params.id;

      const like = await storage.getUserVideoLike(userId, videoId);
      res.json(like || null);
    } catch (error) {
      console.error("Error fetching video like:", error);
      res.status(500).json({ message: "Failed to fetch video like" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
