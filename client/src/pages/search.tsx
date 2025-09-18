import { useParams } from "wouter";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import VideoGrid from "@/components/video-grid";

export default function Search() {
  const { query } = useParams<{ query: string }>();

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      
      <main className="flex-1 flex flex-col">
        <Header />
        
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <h2 className="text-2xl font-bold mb-6">Search results for "{query}"</h2>
          <VideoGrid searchQuery={query || ""} />
        </div>
      </main>
    </div>
  );
}
