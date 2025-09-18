import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, Bell } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <form onSubmit={handleSearch} className="relative flex-1" id="search-form">
          <Input
            type="text"
            placeholder="Search videos, channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10"
            data-testid="input-search"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </form>
        <Button type="submit" form="search-form" data-testid="button-search">
          <Search className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        <Link href="/upload">
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" data-testid="button-upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </Link>
        
        <div className="relative">
          <Button variant="ghost" size="icon" data-testid="button-notifications">
            <Bell className="w-4 h-4" />
          </Button>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </div>
      </div>
    </header>
  );
}
