import {
  users,
  channels,
  videos,
  categories,
  subscriptions,
  watchHistory,
  videoLikes,
  type User,
  type UpsertUser,
  type Channel,
  type InsertChannel,
  type Video,
  type InsertVideo,
  type Category,
  type InsertCategory,
  type Subscription,
  type InsertSubscription,
  type WatchHistory,
  type InsertWatchHistory,
  type VideoLike,
  type InsertVideoLike,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, or, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Channel operations
  createChannel(channel: InsertChannel): Promise<Channel>;
  getChannel(id: string): Promise<Channel | undefined>;
  getChannelsByOwner(userId: string): Promise<Channel[]>;
  updateChannel(id: string, updates: Partial<InsertChannel>): Promise<Channel | undefined>;
  deleteChannel(id: string): Promise<void>;

  // Video operations
  createVideo(video: InsertVideo): Promise<Video>;
  getVideo(id: string): Promise<Video | undefined>;
  getVideos(limit?: number, offset?: number): Promise<Video[]>;
  getVideosByChannel(channelId: string, limit?: number, offset?: number): Promise<Video[]>;
  getVideosByCategory(categoryId: string, limit?: number, offset?: number): Promise<Video[]>;
  searchVideos(query: string, limit?: number, offset?: number): Promise<Video[]>;
  updateVideo(id: string, updates: Partial<InsertVideo>): Promise<Video | undefined>;
  deleteVideo(id: string): Promise<void>;
  incrementViewCount(videoId: string): Promise<void>;

  // Category operations
  createCategory(category: InsertCategory): Promise<Category>;
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;

  // Subscription operations
  subscribe(subscription: InsertSubscription): Promise<Subscription>;
  unsubscribe(userId: string, channelId: string): Promise<void>;
  getUserSubscriptions(userId: string): Promise<Subscription[]>;
  isSubscribed(userId: string, channelId: string): Promise<boolean>;

  // Watch history operations
  addToWatchHistory(watchHistory: InsertWatchHistory): Promise<WatchHistory>;
  getUserWatchHistory(userId: string, limit?: number, offset?: number): Promise<WatchHistory[]>;
  updateWatchTime(userId: string, videoId: string, watchTime: number): Promise<void>;

  // Video likes operations
  likeVideo(videoLike: InsertVideoLike): Promise<VideoLike>;
  removeLike(userId: string, videoId: string): Promise<void>;
  getUserVideoLike(userId: string, videoId: string): Promise<VideoLike | undefined>;
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

  // Channel operations
  async createChannel(channel: InsertChannel): Promise<Channel> {
    const [newChannel] = await db.insert(channels).values(channel).returning();
    return newChannel;
  }

  async getChannel(id: string): Promise<Channel | undefined> {
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel;
  }

  async getChannelsByOwner(userId: string): Promise<Channel[]> {
    return await db
      .select()
      .from(channels)
      .where(eq(channels.ownerUserId, userId))
      .orderBy(desc(channels.createdAt));
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
            like(videos.title, `%${query}%`),
            like(videos.description, `%${query}%`)
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

  // Subscription operations
  async subscribe(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    
    // Update channel subscriber count
    await db
      .update(channels)
      .set({ subscriberCount: sql`${channels.subscriberCount} + 1` })
      .where(eq(channels.id, subscription.channelId));
    
    return newSubscription;
  }

  async unsubscribe(userId: string, channelId: string): Promise<void> {
    await db
      .delete(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.channelId, channelId)));
    
    // Update channel subscriber count
    await db
      .update(channels)
      .set({ subscriberCount: sql`GREATEST(0, ${channels.subscriberCount} - 1)` })
      .where(eq(channels.id, channelId));
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt));
  }

  async isSubscribed(userId: string, channelId: string): Promise<boolean> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.channelId, channelId)));
    return !!subscription;
  }

  // Watch history operations
  async addToWatchHistory(watchHistoryData: InsertWatchHistory): Promise<WatchHistory> {
    // Check if entry already exists
    const [existing] = await db
      .select()
      .from(watchHistory)
      .where(
        and(
          eq(watchHistory.userId, watchHistoryData.userId),
          eq(watchHistory.videoId, watchHistoryData.videoId)
        )
      );

    if (existing) {
      // Update existing entry
      const [updated] = await db
        .update(watchHistory)
        .set({
          watchTime: watchHistoryData.watchTime || existing.watchTime,
          lastWatchedAt: new Date(),
        })
        .where(eq(watchHistory.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new entry
      const [newEntry] = await db.insert(watchHistory).values(watchHistoryData).returning();
      return newEntry;
    }
  }

  async getUserWatchHistory(userId: string, limit = 20, offset = 0): Promise<WatchHistory[]> {
    return await db
      .select()
      .from(watchHistory)
      .where(eq(watchHistory.userId, userId))
      .orderBy(desc(watchHistory.lastWatchedAt))
      .limit(limit)
      .offset(offset);
  }

  async updateWatchTime(userId: string, videoId: string, watchTime: number): Promise<void> {
    await db
      .update(watchHistory)
      .set({ watchTime, lastWatchedAt: new Date() })
      .where(
        and(
          eq(watchHistory.userId, userId),
          eq(watchHistory.videoId, videoId)
        )
      );
  }

  // Video likes operations
  async likeVideo(videoLike: InsertVideoLike): Promise<VideoLike> {
    // Check if like already exists
    const [existing] = await db
      .select()
      .from(videoLikes)
      .where(
        and(
          eq(videoLikes.userId, videoLike.userId),
          eq(videoLikes.videoId, videoLike.videoId)
        )
      );

    if (existing) {
      // Update existing like
      const [updated] = await db
        .update(videoLikes)
        .set({ isLike: videoLike.isLike })
        .where(eq(videoLikes.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new like
      const [newLike] = await db.insert(videoLikes).values(videoLike).returning();
      return newLike;
    }
  }

  async removeLike(userId: string, videoId: string): Promise<void> {
    await db
      .delete(videoLikes)
      .where(
        and(
          eq(videoLikes.userId, userId),
          eq(videoLikes.videoId, videoId)
        )
      );
  }

  async getUserVideoLike(userId: string, videoId: string): Promise<VideoLike | undefined> {
    const [like] = await db
      .select()
      .from(videoLikes)
      .where(
        and(
          eq(videoLikes.userId, userId),
          eq(videoLikes.videoId, videoId)
        )
      );
    return like;
  }
}

export const storage = new DatabaseStorage();
