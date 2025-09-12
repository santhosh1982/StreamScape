import { useQuery } from "@tanstack/react-query";
import VideoCard from "@/components/video-card";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoGridProps {
  channelId?: string;
  categoryId?: string;
  searchQuery?: string;
  limit?: number;
}

export default function VideoGrid({ channelId, categoryId, searchQuery, limit = 20 }: VideoGridProps) {
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ["/api/videos", { channelId, categoryId, searchQuery, limit }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (channelId) params.append('channelId', channelId);
      if (categoryId) params.append('categoryId', categoryId);
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', limit.toString());
      
      return fetch(`/api/videos?${params}`).then(res => res.json());
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="flex gap-3">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load videos. Please try again later.</p>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground" data-testid="text-no-videos">
          {searchQuery ? "No videos found for your search." : "No videos available."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="video-grid">
      {videos.map((video: any) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
