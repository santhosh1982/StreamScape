import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import VideoGrid from "@/components/video-grid";

export default function Liked() {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      
      <main className="flex-1 flex flex-col">
        <Header />
        
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <h2 className="text-2xl font-bold mb-6">Liked Videos</h2>
          <VideoGrid liked={true} />
        </div>
      </main>
    </div>
  );
}