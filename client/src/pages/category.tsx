import { useParams } from "wouter";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import VideoGrid from "@/components/video-grid";
import { useQuery } from "@tanstack/react-query";

export default function Category() {
  const { name } = useParams<{ name: string }>();
  const { data: categories } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const category = categories?.find((c) => c.name.toLowerCase() === name);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      
      <main className="flex-1 flex flex-col">
        <Header />
        
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <h2 className="text-2xl font-bold mb-6">{name}</h2>
          <VideoGrid categoryId={category?.id} />
        </div>
      </main>
    </div>
  );
}
