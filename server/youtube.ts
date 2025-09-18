import { google } from "googleapis";
import { db } from "./db";
import { channels, videos } from "@shared/schema";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

async function getChannelId(query: string) {
  try {
    const response = await youtube.search.list({
      part: ["snippet"],
      q: query,
      type: ["channel"],
    });

    return response.data.items?.[0]?.snippet?.channelId;
  } catch (error) {
    console.error("Error fetching channel ID:", error);
    return null;
  }
}

export async function searchVideos(query: string, maxResults: number, pageToken?: string) {
  try {
    const channelId = await getChannelId(query);

    if (!channelId) {
      return { videos: [], nextPageToken: undefined, prevPageToken: undefined };
    }

    const response = await youtube.search.list({
      part: ["snippet"],
      channelId: channelId,
      maxResults: maxResults,
      order: "date",
      pageToken: pageToken,
    });

    const videoIds = response.data.items?.map((item) => item.id?.videoId).filter(Boolean) as string[];

    const videoDetails = await youtube.videos.list({
      part: ["snippet", "contentDetails"],
      id: videoIds,
    });

    const [dbChannel] = await db.insert(channels).values({
      name: query,
    }).returning();

    const videos = videoDetails.data.items?.map((item) => ({
      title: item.snippet?.title || "",
      description: item.snippet?.description || "",
      thumbnailUrl: item.snippet?.thumbnails?.high?.url || "",
      youtubeVideoId: item.id || "",
      channelId: dbChannel.id,
    })) || [];

    return {
      videos,
      nextPageToken: response.data.nextPageToken || undefined,
      prevPageToken: response.data.prevPageToken || undefined,
    };
  } catch (error) {
    console.error("Error searching videos:", error);
    return { videos: [], nextPageToken: undefined, prevPageToken: undefined };
  }
}

export async function getVideo(id: string) {
  try {
    const response = await youtube.videos.list({
      part: ["snippet", "contentDetails"],
      id: [id],
    });

    const item = response.data.items?.[0];

    if (!item) {
      return null;
    }

    return {
      title: item.snippet?.title || "",
      description: item.snippet?.description || "",
      thumbnailUrl: item.snippet?.thumbnails?.high?.url || "",
      youtubeVideoId: item.id || "",
      channelId: item.snippet?.channelId || "",
    };
  } catch (error) {
    console.error("Error fetching video:", error);
    return null;
  }
}
