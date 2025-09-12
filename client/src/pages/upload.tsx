import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CloudUpload, X } from "lucide-react";

export default function Upload() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    channelId: "",
    tags: "",
    isPublic: true,
    qualities: ["1080p", "720p", "480p"]
  });

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

  const { data: categories } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  const { data: userChannels } = useQuery<any[]>({
    queryKey: ["/api/channels"],
    queryFn: () => fetch(`/api/channels?owner=${(user as any)?.id}`).then(res => res.json()),
    enabled: isAuthenticated && !!(user as any)?.id,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("No file selected");
      
      const data = new FormData();
      data.append("video", selectedFile);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("categoryId", formData.categoryId);
      data.append("channelId", formData.channelId);
      data.append("tags", formData.tags);
      data.append("isPublic", formData.isPublic.toString());

      return await apiRequest("POST", "/api/videos", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video uploaded successfully! Processing will begin shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      // Reset form
      setSelectedFile(null);
      setFormData({
        title: "",
        description: "",
        categoryId: "",
        channelId: "",
        tags: "",
        isPublic: true,
        qualities: ["1080p", "720p", "480p"]
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid File",
          description: "Please select a valid video file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (2GB limit)
      if (file.size > 2 * 1024 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 2GB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect({ target: { files: [file] } } as any);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a video file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a title for your video.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.channelId) {
      toast({
        title: "No Channel Selected",
        description: "Please select a channel for your video.",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate();
  };

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
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CloudUpload className="w-5 h-5" />
                  Upload Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* File Upload Area */}
                  <div>
                    <Label>Video File</Label>
                    <div 
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => document.getElementById('video-file')?.click()}
                      data-testid="upload-drop-zone"
                    >
                      {selectedFile ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <CloudUpload className="w-8 h-8 text-primary" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <h3 className="font-semibold">{selectedFile.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <CloudUpload className="w-12 h-12 text-muted-foreground mx-auto" />
                          <h3 className="font-semibold">Drag and drop video files to upload</h3>
                          <p className="text-muted-foreground">or click to select files</p>
                          <Button type="button" variant="outline">
                            Select Files
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Supported formats: MP4, MOV, AVI, MKV (Max 2GB)
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      id="video-file"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileSelect}
                      data-testid="input-video-file"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter video title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        data-testid="input-video-title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="channel">Channel *</Label>
                      <Select 
                        value={formData.channelId} 
                        onValueChange={(value) => setFormData({ ...formData, channelId: value })}
                      >
                        <SelectTrigger data-testid="select-channel">
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                        <SelectContent>
                          {userChannels?.map((channel: any) => (
                            <SelectItem key={channel.id} value={channel.id}>
                              {channel.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your video..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      data-testid="textarea-description"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={formData.categoryId} 
                        onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                      >
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        placeholder="Add tags separated by commas"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        data-testid="input-tags"
                      />
                    </div>
                  </div>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3">Quality Settings</h4>
                      <div className="space-y-2">
                        {["1080p", "720p", "480p"].map((quality) => (
                          <div key={quality} className="flex items-center space-x-2">
                            <Checkbox
                              id={quality}
                              checked={formData.qualities.includes(quality)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    qualities: [...formData.qualities, quality]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    qualities: formData.qualities.filter(q => q !== quality)
                                  });
                                }
                              }}
                              data-testid={`checkbox-quality-${quality}`}
                            />
                            <Label htmlFor={quality} className="text-sm">
                              {quality} {quality === "1080p" && "(Recommended)"}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Multiple qualities will be generated for optimal streaming
                      </p>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isPublic"
                        checked={formData.isPublic}
                        onCheckedChange={(checked) => setFormData({ ...formData, isPublic: !!checked })}
                        data-testid="checkbox-public"
                      />
                      <Label htmlFor="isPublic" className="text-sm">
                        Make this video public
                      </Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-4 border-t border-border">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={uploadMutation.isPending}
                      data-testid="button-upload-video"
                    >
                      {uploadMutation.isPending ? "Uploading..." : "Upload Video"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
