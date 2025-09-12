import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play, Home, TrendingUp, Users, History, ThumbsUp, Gamepad2, Music, GraduationCap, Trophy, Newspaper } from "lucide-react";
import { Link, useLocation } from "wouter";

const navigationItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: TrendingUp, label: "Trending", href: "/trending" },
  { icon: Users, label: "Subscriptions", href: "/subscriptions" },
  { icon: History, label: "History", href: "/history" },
  { icon: ThumbsUp, label: "Liked Videos", href: "/liked" },
];

const categoryItems = [
  { icon: Gamepad2, label: "Gaming", href: "/category/gaming" },
  { icon: Music, label: "Music", href: "/category/music" },
  { icon: GraduationCap, label: "Education", href: "/category/education" },
  { icon: Trophy, label: "Sports", href: "/category/sports" },
  { icon: Newspaper, label: "News", href: "/category/news" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border flex-shrink-0 custom-scrollbar overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Play className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold" data-testid="text-app-title">StreamHub</h1>
        </div>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
                    isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            Categories
          </h3>
          <nav className="space-y-2">
            {categoryItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-secondary",
                      isActive && "bg-secondary text-foreground"
                    )}
                    data-testid={`category-${item.label.toLowerCase()}`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
