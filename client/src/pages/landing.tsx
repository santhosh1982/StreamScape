import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Users, Upload, Star } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold">StreamHub</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The ultimate video streaming platform where creators and viewers come together.
            Share your passion, discover amazing content, and build your community.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6"
            data-testid="button-login"
            onClick={() => setLocation("/home")}
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-8">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Watch Anywhere</h3>
              <p className="text-muted-foreground">
                Stream high-quality videos with multiple resolution options. 
                Enjoy seamless playback on any device.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-8">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Content</h3>
              <p className="text-muted-foreground">
                Upload your videos with ease. Our platform supports multiple formats 
                and automatically optimizes for the best viewing experience.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-8">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Build Community</h3>
              <p className="text-muted-foreground">
                Connect with other creators and viewers. Subscribe to channels, 
                like videos, and engage with your favorite content.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hero Section */}
        <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-0">
          <CardContent className="p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  Join thousands of creators who are already sharing their passion on StreamHub. 
                  Whether you're here to watch or create, there's something for everyone.
                </p>
                <div className="flex gap-4">
                  <Button 
                    size="lg"
                    data-testid="button-login-hero"
                    onClick={() => setLocation("/home")}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Watching
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    data-testid="button-create-hero"
                    onClick={() => setLocation("/home")}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Start Creating
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-64 h-40 bg-muted rounded-lg flex items-center justify-center">
                    <Play className="w-16 h-16 text-muted-foreground" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-accent-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
