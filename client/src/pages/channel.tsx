import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import VideoGrid from "@/components/video-grid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Channel() {
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

  const { data: channel, isLoading: channelLoading, error } = useQuery<any>({
    queryKey: ["/api/channels", id],
    queryFn: () => fetch(`/api/channels/${id}`).then(res => res.json()),
    enabled: isAuthenticated && !!id,
  });

  const { data: isSubscribed } = useQuery<any>({
    queryKey: ["/api/subscriptions", id, "status"],
    queryFn: () => fetch(`/api/subscriptions/${id}/status`).then(res => res.json()),
    enabled: isAuthenticated && !!id,
  });

  if (isLoading || channelLoading) {
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

  if (!channel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Channel Not Found</h2>
            <p className="text-muted-foreground">This channel doesn't exist or has been removed.</p>
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
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Channel Header */}
          <div className="relative">
            {channel.bannerUrl && (
              <div className="h-48 bg-gradient-to-r from-primary/20 to-accent/20">
                <img 
                  src={channel.bannerUrl}
                  alt={`${channel.name} banner`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="bg-card border-b border-border">
              <div className="max-w-6xl mx-auto p-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    {channel.avatarUrl ? (
                      <img 
                        src={channel.avatarUrl}
                        alt={`${channel.name} avatar`}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-primary-foreground font-bold text-2xl">
                        {channel.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2" data-testid="text-channel-name">{channel.name}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground mb-3">
                      <span data-testid="text-subscriber-count">
                        {channel.subscriberCount?.toLocaleString() || 0} subscribers
                      </span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    {channel.description && (
                      <p className="text-sm text-muted-foreground max-w-2xl" data-testid="text-channel-description">
                        {channel.description}
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    variant={isSubscribed?.isSubscribed ? "secondary" : "default"}
                    data-testid="button-subscribe-channel"
                  >
                    {isSubscribed?.isSubscribed ? "Subscribed" : "Subscribe"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Channel Content */}
          <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Videos</h2>
              <VideoGrid channelId={id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
