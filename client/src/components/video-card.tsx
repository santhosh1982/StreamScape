import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnailUrl?: string;
    duration?: number;
    channelId: string;
    viewCount?: number;
    createdAt: string;
    channel?: {
      name: string;
      avatarUrl?: string;
    };
    processingStatus?: string;
    youtubeVideoId?: string;
  };
}

export default function VideoCard({ video }: VideoCardProps) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "00:00";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getChannelInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getQualityBadge = () => {
    // This would typically come from the processed URLs
    return "1080p";
  };

  const href = video.youtubeVideoId ? `/watch/${video.youtubeVideoId}` : `/watch/${video.id}`;

  return (
    <Link href={href}>
      <div className="group cursor-pointer" data-testid={`video-card-${video.id}`}>
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-3">
          {video.thumbnailUrl ? (
            <img 
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="text-muted-foreground">No thumbnail</div>
            </div>
          )}
          
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded" data-testid="text-duration">
              {formatDuration(video.duration)}
            </div>
          )}
          
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-accent text-accent-foreground text-xs" data-testid="text-quality">
              {getQualityBadge()}
            </Badge>
          </div>
          
          {video.processingStatus === "processing" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="outline" className="bg-background/80">Processing...</Badge>
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex-shrink-0 flex items-center justify-center">
            {video.channel?.avatarUrl ? (
              <img 
                src={video.channel.avatarUrl}
                alt={`${video.channel.name} avatar`}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-primary-foreground text-xs font-semibold">
                {video.channel?.name ? getChannelInitials(video.channel.name) : 'CH'}
              </span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors" data-testid="text-video-title">
              {video.title}
            </h4>
            {video.channel && (
              <p className="text-sm text-muted-foreground mb-1" data-testid="text-channel-name">
                {video.channel.name}
              </p>
            )}
            <p className="text-sm text-muted-foreground" data-testid="text-video-stats">
              {video.viewCount?.toLocaleString() || 0} views • {video.createdAt && formatDistance(new Date(video.createdAt), new Date(), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
