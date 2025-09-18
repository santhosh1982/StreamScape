import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChannelCardProps {
  name: string;
  subscribers: string;
  description: string;
  avatar: string;
  avatarBg?: string;
}

export default function ChannelCard({ 
  name, 
  subscribers, 
  description, 
  avatar, 
  avatarBg = "bg-primary",
}: ChannelCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      // Not implemented
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "Success",
        description: "Subscribed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="hover:bg-card/80 transition-colors cursor-pointer" data-testid={`channel-card-${name.toLowerCase().replace(' ', '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 ${avatarBg} rounded-full flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-bold text-lg" data-testid="text-channel-avatar">
              {avatar}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-foreground" data-testid="text-channel-name">{name}</h4>
            <p className="text-sm text-muted-foreground" data-testid="text-subscriber-count">{subscribers} subscribers</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4" data-testid="text-channel-description">
          {description}
        </p>
        <Button 
          className="w-full"
          onClick={() => subscribeMutation.mutate()}
          disabled={subscribeMutation.isPending}
          data-testid="button-subscribe-channel"
        >
          {subscribeMutation.isPending 
            ? "Loading..." 
            : "Subscribe"
          }
        </Button>
      </CardContent>
    </Card>
  );
}
