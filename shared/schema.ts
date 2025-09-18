import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const channels = pgTable("channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  avatarUrl: varchar("avatar_url"),
  bannerUrl: varchar("banner_url"),
  ownerUserId: varchar("owner_user_id"),
  subscriberCount: integer("subscriber_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 50 }).notNull(),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  thumbnailUrl: varchar("thumbnail_url"),
  duration: integer("duration"), // in seconds
  channelId: varchar("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id").references(() => categories.id),
  tags: text("tags").array(),
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  isPublic: boolean("is_public").default(true),
  videoUrl: varchar("video_url"), // Original video file URL
  youtubeVideoId: varchar("youtube_video_id"),
  processedUrls: jsonb("processed_urls"), // URLs for different qualities
  processingStatus: varchar("processing_status").default("pending"), // pending, processing, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// Relations
export const channelsRelations = relations(channels, ({ many }) => ({
  videos: many(videos),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  videos: many(videos),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  channel: one(channels, {
    fields: [videos.channelId],
    references: [channels.id],
  }),
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
}));

// Insert schemas
export const insertChannelSchema = createInsertSchema(channels).omit({
  id: true,
  subscriberCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVideoSchema = createInsertSchema(videos, {
  isPublic: z.preprocess((val) => val === 'true', z.boolean()),
}).omit({
  id: true,
  viewCount: true,
  likeCount: true,
  processingStatus: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

// Types
export type Channel = typeof channels.$inferSelect;
export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;