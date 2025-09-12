import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import VideoPlayer from "@/components/video-player";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Share2, Download } from "lucide-react";

export default function Watch() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: video, isLoading: videoLoading, error } = useQuery<any>({
    queryKey: ["/api/videos", id],
    enabled: isAuthenticated && !!id,
  });

  const { data: channel } = useQuery<any>({
    queryKey: ["/api/channels", video?.channelId],
    enabled: !!video?.channelId,
  });

  const { data: userLike } = useQuery<any>({
    queryKey: ["/api/videos", id, "like"],
    enabled: isAuthenticated && !!id,
  });

  if (isLoading || videoLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
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
                <VideoPlayer 
                  videoId={video.id}
                  videoUrl={video.videoUrl || ""}
                  title={video.title}
                  data-testid="video-player-main"
                />
                
                {/* Video Info */}
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold" data-testid="text-video-title">{video.title}</h1>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {channel && (
                        <>
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground font-semibold text-sm">
                              {channel.name.slice(0, 2).toUpperCase()}
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
                          className={`rounded-r-none ${userLike?.isLike ? 'text-primary' : ''}`}
                          data-testid="button-like"
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          {video.likeCount || 0}
                        </Button>
                        <div className="w-px h-6 bg-border"></div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`rounded-l-none ${userLike?.isLike === false ? 'text-destructive' : ''}`}
                          data-testid="button-dislike"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button variant="secondary" size="sm" data-testid="button-share">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="secondary" size="sm" data-testid="button-download">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground" data-testid="text-video-stats">
                    {video.viewCount?.toLocaleNumber() || 0} views • {new Date(video.createdAt!).toLocaleDateString()}
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
