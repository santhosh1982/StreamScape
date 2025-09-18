import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChannelSchema, insertVideoSchema, insertCategorySchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { searchVideos as searchYoutubeVideos, getVideo as getYoutubeVideo } from "./youtube";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const upload = multer({ dest: "uploads/" });

function sanitizeFilename(filename: string): string {
  return filename.replace(/[\\/:*?"<>|]/g, "");
}

export async function registerRoutes(app: Express): Promise<Server> {
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

  app.post('/api/categories', async (req, res) => {
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
      const channels = await storage.getChannels();
      res.json(channels);
    } catch (error) {
      console.error("Error fetching channels:", error);
      res.status(500).json({ message: "Failed to fetch channels" });
    }
  });

  // Featured channels endpoint
  app.get('/api/channels/featured', async (req, res) => {
    try {
      // For MVP, return empty array - can be enhanced later with actual featured logic
      res.json([]);
    } catch (error) {
      console.error("Error fetching featured channels:", error);
      res.status(500).json({ message: "Failed to fetch featured channels" });
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

  app.post('/api/channels', async (req: any, res) => {
    try {
      const channelData = insertChannelSchema.parse(req.body);
      const channel = await storage.createChannel(channelData);
      res.status(201).json(channel);
    } catch (error) {
      console.error("Error creating channel:", error);
      res.status(500).json({ message: "Failed to create channel" });
    }
  });

  app.patch('/api/channels/:id', async (req: any, res) => {
    try {
      const updates = insertChannelSchema.partial().parse(req.body);
      const updatedChannel = await storage.updateChannel(req.params.id, updates);
      res.json(updatedChannel);
    } catch (error) {
      console.error("Error updating channel:", error);
      res.status(500).json({ message: "Failed to update channel" });
    }
  });

  app.delete('/api/channels/:id', async (req: any, res) => {
    try {
      await storage.deleteChannel(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting channel:", error);
      res.status(500).json({ message: "Failed to delete channel" });
    }
  });

  // Videos routes
  app.get('/api/videos/trending', async (req, res) => {
    try {
      const videos = await storage.getTrendingVideos();
      res.json(videos);
    } catch (error) {
      console.error("Error fetching trending videos:", error);
      res.status(500).json({ message: "Failed to fetch trending videos" });
    }
  });

  app.get('/api/videos/liked', async (req, res) => {
    try {
      const videos = await storage.getLikedVideos();
      res.json(videos);
    } catch (error) {
      console.error("Error fetching liked videos:", error);
      res.status(500).json({ message: "Failed to fetch liked videos" });
    }
  });

  app.get('/api/videos', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const channelId = req.query.channelId as string;
      const categoryId = req.query.categoryId as string;
      const search = req.query.search as string;
      const pageToken = req.query.pageToken as string | undefined;

      let videos;
      let nextPageToken: string | undefined = undefined;
      let prevPageToken: string | undefined = undefined;

      if (search) {
        const localVideos = await storage.searchVideos(search, limit, offset);
        const youtubeSearchResult = await searchYoutubeVideos(search, limit, pageToken);
        videos = [...localVideos, ...youtubeSearchResult.videos];
        nextPageToken = youtubeSearchResult.nextPageToken;
        prevPageToken = youtubeSearchResult.prevPageToken;
      } else if (channelId) {
        videos = await storage.getVideosByChannel(channelId, limit, offset);
      } else if (categoryId) {
        videos = await storage.getVideosByCategory(categoryId, limit, offset);
      } else {
        videos = await storage.getVideos(limit, offset);
      }

      res.json({ videos, nextPageToken, prevPageToken });
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.get('/api/videos/:id', async (req, res) => {
    try {
      let video = await storage.getVideo(req.params.id);

      if (!video) {
        video = await getYoutubeVideo(req.params.id);
      }

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

  app.get('/api/videos/:id/download', async (req, res) => {
    try {
      const videoId = req.params.id;
      let video = await storage.getVideo(videoId);

      if (video && video.videoUrl) {
        const filePath = path.join(__dirname, '..', video.videoUrl);
        return res.download(filePath, `${sanitizeFilename(video.title)}.mp4`);
      }

      const youtubeVideo = await getYoutubeVideo(videoId);
      if (youtubeVideo) {
        const videoUrl = `https://www.youtube.com/watch?v=${youtubeVideo.youtubeVideoId}`;
        const videoPath = path.join(__dirname, '..', 'uploads', `${videoId}_video.mp4`);
        const audioPath = path.join(__dirname, '..', 'uploads', `${videoId}_audio.mp4`);
        const outputPath = path.join(__dirname, '..', 'uploads', `${sanitizeFilename(youtubeVideo.title)}.mp4`);

        const videoStream = ytdl(videoUrl, { quality: 'highestvideo' }).pipe(fs.createWriteStream(videoPath));
        const audioStream = ytdl(videoUrl, { quality: 'highestaudio' }).pipe(fs.createWriteStream(audioPath));

        await Promise.all([
          new Promise(resolve => videoStream.on('finish', resolve)),
          new Promise(resolve => audioStream.on('finish', resolve))
        ]);

        ffmpeg()
          .input(videoPath)
          .input(audioPath)
          .outputOptions('-c:v copy')
          .outputOptions('-c:a aac')
          .toFormat('mp4')
          .on('end', () => {
            res.download(outputPath, (err) => {
              fs.unlinkSync(videoPath);
              fs.unlinkSync(audioPath);
              fs.unlinkSync(outputPath);
            });
          })
          .on('error', (err) => {
            console.error('Error during ffmpeg processing:', err);
            res.status(500).json({ message: "Failed to process video" });
            fs.unlinkSync(videoPath);
            fs.unlinkSync(audioPath);
          })
          .save(outputPath);

      } else {
        return res.status(404).json({ message: "Video not found" });
      }
    } catch (error) {
      console.error("Error downloading video:", error);
      res.status(500).json({ message: "Failed to download video" });
    }
  });

  app.post('/api/videos/:id/like', async (req, res) => {
    try {
      await storage.likeVideo(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error liking video:", error);
      res.status(500).json({ message: "Failed to like video" });
    }
  });

  app.post('/api/videos', upload.single('video'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Video file required" });
      }

      const videoData = insertVideoSchema.parse({
        ...req.body,
        videoUrl: `/uploads/${req.file.filename}`,
        tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : [],
      });

      const video = await storage.createVideo(videoData);
      res.status(201).json(video);
    } catch (error) {
      console.error("Error uploading video:", error);
      res.status(500).json({ message: "Failed to upload video" });
    }
  });

  app.patch('/api/videos/:id', async (req: any, res) => {
    try {
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

  app.delete('/api/videos/:id', async (req: any, res) => {
    try {
      await storage.deleteVideo(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
