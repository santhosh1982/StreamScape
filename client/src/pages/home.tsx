import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import VideoGrid from "@/components/video-grid";
import ChannelCard from "@/components/channel-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
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

  const { data: featuredChannels, isLoading: channelsLoading } = useQuery({
    queryKey: ["/api/channels", "featured"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      
      <main className="flex-1 flex flex-col">
        <Header />
        
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {/* Featured Section */}
          <section className="mb-8">
            <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-0">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-4">Featured Content</h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      Discover amazing videos from creators around the world. Upload your content and join our community of passionate creators.
                    </p>
                    <div className="flex gap-4">
                      <Button className="bg-primary hover:bg-primary/90" data-testid="button-start-watching">
                        Start Watching
                      </Button>
                      <Button variant="outline" data-testid="button-create-channel">
                        Create Channel
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full h-48 bg-muted rounded-lg overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                        alt="Video streaming platform interface"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Trending Videos */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold" data-testid="text-trending-videos">Trending Videos</h3>
            </div>
            <VideoGrid />
          </section>

          {/* Featured Channels */}
          <section>
            <h3 className="text-xl font-semibold mb-6" data-testid="text-featured-channels">Featured Channels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ChannelCard 
                name="GamerTech"
                subscribers="2.4M"
                description="Latest gaming reviews, tech tutorials, and epic gameplay moments. Join our community of passionate gamers!"
                avatar="GT"
                avatarBg="bg-primary"
              />
              <ChannelCard 
                name="MusicStudio"
                subscribers="1.8M"
                description="Behind-the-scenes music production, artist interviews, and exclusive recording sessions from top musicians."
                avatar="MS"
                avatarBg="bg-accent"
              />
              <ChannelCard 
                name="AdventureTrails"
                subscribers="3.2M"
                description="Breathtaking travel vlogs, hiking adventures, and outdoor survival tips from around the globe."
                avatar="AT"
                avatarBg="bg-secondary"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
