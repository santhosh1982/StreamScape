import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import VideoPlayer from "@/components/video-player";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Share2, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Watch() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: video, isLoading: videoLoading, error } = useQuery<any>({
    queryKey: ["/api/videos", id],
    enabled: !!id,
  });

  const { data: channel } = useQuery<any>({
    queryKey: ["/api/channels", video?.channelId],
    queryFn: () => fetch(`/api/channels/${video?.channelId}`).then(res => res.json()),
    enabled: !!video?.channelId,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      console.log("Liking video:", id);
      return await apiRequest("POST", `/api/videos/${id}/like`);
    },
    onSuccess: () => {
      console.log("Like successful, invalidating queries...");
      queryClient.invalidateQueries({ queryKey: ["/api/videos", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos/liked"] });
    },
    onError: (error) => {
      console.error("Error liking video:", error);
      toast({
        title: "Error",
        description: "Failed to like video. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Success",
      description: "Link copied to clipboard!",
    });
  };

  if (videoLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error loading video</div>
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Video Not Found</h2>
            <p className="text-muted-foreground">This video doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      
      <main className="flex-1 flex flex-col">
        <Header />
        
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Video Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Video Player */}
                {video.youtubeVideoId ? (
                  <iframe
                    width="100%"
                    height="500"
                    src={`https://www.youtube.com/embed/${video.youtubeVideoId}`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <VideoPlayer 
                    videoId={video.id}
                    videoUrl={video.videoUrl || ""}
                    title={video.title}
                    data-testid="video-player-main"
                  />
                )}
                
                {/* Video Info */}
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold" data-testid="text-video-title">{video.title}</h1>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {channel && (
                        <>
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground font-semibold text-sm">
                              {channel.name?.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold" data-testid="text-channel-name">{channel.name}</h3>
                            <p className="text-sm text-muted-foreground" data-testid="text-subscriber-count">
                              {channel.subscriberCount?.toLocaleString() || 0} subscribers
                            </p>
                          </div>
                          <Button variant="default" data-testid="button-subscribe">
                            Subscribe
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-secondary rounded-lg">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="rounded-r-none"
                          data-testid="button-like"
                          onClick={() => likeMutation.mutate()}
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          {video.likeCount || 0}
                        </Button>
                        <div className="w-px h-6 bg-border"></div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="rounded-l-none"
                          data-testid="button-dislike"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button variant="secondary" size="sm" data-testid="button-share" onClick={handleShare}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <a href={`/api/videos/${video.youtubeVideoId || video.id}/download`} download>
                        <Button variant="secondary" size="sm" data-testid="button-download">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </a>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground" data-testid="text-video-stats">
                    {video.viewCount?.toLocaleString() || 0} views • {new Date(video.createdAt!).toLocaleDateString()}
                  </div>
                  
                  {video.description && (
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm whitespace-pre-wrap" data-testid="text-video-description">
                          {video.description}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
              
              {/* Sidebar - Related Videos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Related Videos</h3>
                <div className="space-y-4">
                  {/* Related videos would be loaded here */}
                  <div className="text-center text-muted-foreground py-8">
                    <p>Related videos will appear here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
