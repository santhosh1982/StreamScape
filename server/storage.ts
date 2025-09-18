import {
  channels,
  videos,
  categories,
  type Channel,
  type InsertChannel,
  type Video,
  type InsertVideo,
  type Category,
  type InsertCategory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, ilike, and, or, sql, count, gt } from "drizzle-orm";

export interface IStorage {
  // Channel operations
  createChannel(channel: InsertChannel): Promise<Channel>;
  getChannel(id: string): Promise<Channel | undefined>;
  getChannels(): Promise<Channel[]>;
  updateChannel(id: string, updates: Partial<InsertChannel>): Promise<Channel | undefined>;
  deleteChannel(id: string): Promise<void>;

  // Video operations
  createVideo(video: InsertVideo): Promise<Video>;
  getVideo(id: string): Promise<Video | undefined>;
  getVideos(limit?: number, offset?: number): Promise<Video[]>;
  getTrendingVideos(limit?: number, offset?: number): Promise<Video[]>;
  getLikedVideos(limit?: number, offset?: number): Promise<Video[]>;
  getVideosByChannel(channelId: string, limit?: number, offset?: number): Promise<Video[]>;
  getVideosByCategory(categoryId: string, limit?: number, offset?: number): Promise<Video[]>;
  searchVideos(query: string, limit?: number, offset?: number): Promise<Video[]>;
  updateVideo(id: string, updates: Partial<InsertVideo>): Promise<Video | undefined>;
  deleteVideo(id: string): Promise<void>;
  incrementViewCount(videoId: string): Promise<void>;
  likeVideo(videoId: string): Promise<void>;

  // Category operations
  createCategory(category: InsertCategory): Promise<Category>;
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Channel operations
  async createChannel(channel: InsertChannel): Promise<Channel> {
    const [newChannel] = await db.insert(channels).values(channel).returning();
    return newChannel;
  }

  async getChannel(id: string): Promise<Channel | undefined> {
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel;
  }

  async getChannels(): Promise<Channel[]> {
    return await db.select().from(channels).orderBy(desc(channels.createdAt));
  }

  async updateChannel(id: string, updates: Partial<InsertChannel>): Promise<Channel | undefined> {
    const [updatedChannel] = await db
      .update(channels)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(channels.id, id))
      .returning();
    return updatedChannel;
  }

  async deleteChannel(id: string): Promise<void> {
    await db.delete(channels).where(eq(channels.id, id));
  }

  // Video operations
  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo;
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async getVideos(limit = 20, offset = 0): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(eq(videos.isPublic, true))
      .orderBy(desc(videos.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getTrendingVideos(limit = 20, offset = 0): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(eq(videos.isPublic, true))
      .orderBy(desc(videos.viewCount))
      .limit(limit)
      .offset(offset);
  }

  async getLikedVideos(limit = 20, offset = 0): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(gt(videos.likeCount, 0))
      .orderBy(desc(videos.likeCount))
      .limit(limit)
      .offset(offset);
  }

  async getVideosByChannel(channelId: string, limit = 20, offset = 0): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(and(eq(videos.channelId, channelId), eq(videos.isPublic, true)))
      .orderBy(desc(videos.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getVideosByCategory(categoryId: string, limit = 20, offset = 0): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(and(eq(videos.categoryId, categoryId), eq(videos.isPublic, true)))
      .orderBy(desc(videos.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async searchVideos(query: string, limit = 20, offset = 0): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(
        and(
          eq(videos.isPublic, true),
          or(
            ilike(videos.title, `%${query}%`),
            ilike(videos.description, `%${query}%`)
          )
        )
      )
      .orderBy(desc(videos.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateVideo(id: string, updates: Partial<InsertVideo>): Promise<Video | undefined> {
    const [updatedVideo] = await db
      .update(videos)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(videos.id, id))
      .returning();
    return updatedVideo;
  }

  async deleteVideo(id: string): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  async incrementViewCount(videoId: string): Promise<void> {
    await db
      .update(videos)
      .set({ viewCount: sql`${videos.viewCount} + 1` })
      .where(eq(videos.id, videoId));
  }

  async likeVideo(videoId: string): Promise<void> {
    await db
      .update(videos)
      .set({ likeCount: sql`${videos.likeCount} + 1` })
      .where(eq(videos.id, videoId));
  }

  // Category operations
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
}

export const storage = new DatabaseStorage();