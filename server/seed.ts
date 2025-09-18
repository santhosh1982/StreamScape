import { db } from "./db";
import { categories, videos } from "@shared/schema";
import { count } from "drizzle-orm";
import { searchVideos } from "./youtube";

async function main() {
  const data: (typeof categories.$inferInsert)[] = [
    {
      name: "Gaming",
      icon: "gamepad-2",
    },
    {
      name: "Music",
      icon: "music",
    },
    {
      name: "Education",
      icon: "graduation-cap",
    },
    {
      name: "Sports",
      icon: "trophy",
    },
    {
      name: "News",
      icon: "newspaper",
    },
  ];

  const [categoryCount] = await db.select({ value: count() }).from(categories);

  if (categoryCount.value === 0) {
    console.log("Seed start");
    await db.insert(categories).values(data).onConflictDoNothing();
    console.log("Seed done");
  }

  const [videoCount] = await db.select({ value: count() }).from(videos);

  if (videoCount.value === 0) {
    console.log("Importing videos from YouTube");
    const videos = await searchVideos("freecodecamp", 10);
    await db.insert(videos).values(videos);
    console.log("YouTube import done");
  }
}

main();
