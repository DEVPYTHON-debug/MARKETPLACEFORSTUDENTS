import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Share2, MessageCircle, Plus, Search } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Advertisement {
  id: string;
  userId: string;
  title: string;
  description: string;
  imageUrl?: string;
  price?: string;
  category: string;
  location?: string;
  likes: number;
  shares: number;
  comments: number;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    isVerified: boolean;
  };
}

const categories = [
  "Electronics", "Fashion", "Home & Garden", "Sports", "Books", 
  "Automotive", "Real Estate", "Jobs", "Services", "Other"
];

export default function Advertisements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAd, setNewAd] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    location: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: advertisements = [], isLoading } = useQuery({
    queryKey: ["/api/advertisements", selectedCategory, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.set("category", selectedCategory);
      if (searchTerm) params.set("search", searchTerm);
      
      const response = await fetch(`/api/advertisements?${params}`);
      if (!response.ok) throw new Error("Failed to fetch advertisements");
      return response.json();
    },
  });

  const createAdMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return fetch("/api/advertisements", {
        method: "POST",
        body: data,
      }).then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Failed to create advertisement");
        }
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: "Advertisement Created!",
        description: "Your advertisement has been posted successfully.",
      });
      setIsCreateDialogOpen(false);
      setNewAd({ title: "", description: "", price: "", category: "", location: "" });
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Advertisement",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (adId: string) => {
      return apiRequest("POST", `/api/advertisements/${adId}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements"] });
    },
  });

  const shareMutation = useMutation({
    mutationFn: async (adId: string) => {
      return apiRequest("POST", `/api/advertisements/${adId}/share`, {});
    },
    onSuccess: () => {
      toast({
        title: "Shared!",
        description: "Advertisement shared successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements"] });
    },
  });

  const handleCreateAd = () => {
    if (!newAd.title.trim() || !newAd.description.trim() || !newAd.category.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in title, description, and category.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", newAd.title.trim());
    formData.append("description", newAd.description.trim());
    formData.append("price", newAd.price.trim() || "0");
    formData.append("category", newAd.category.trim());
    
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    createAdMutation.mutate(formData);
  };

  const handleLike = (adId: string) => {
    likeMutation.mutate(adId);
  };

  const handleShare = (adId: string) => {
    shareMutation.mutate(adId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-gray-400">Loading advertisements...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Marketplace</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="neon-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Post Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Create Advertisement</DialogTitle>
              <DialogDescription className="text-gray-400">
                Post your item or service to the marketplace
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-gray-300">Title</Label>
                <Input
                  id="title"
                  value={newAd.title}
                  onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="What are you selling?"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  value={newAd.description}
                  onChange={(e) => setNewAd({ ...newAd, description: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
                  placeholder="Describe your item..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-gray-300">Price (₦)</Label>
                  <Input
                    id="price"
                    value={newAd.price}
                    onChange={(e) => setNewAd({ ...newAd, price: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-gray-300">Category</Label>
                  <Select value={newAd.category} onValueChange={(value) => setNewAd({ ...newAd, category: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="text-white">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="location" className="text-gray-300">Location</Label>
                <Input
                  id="location"
                  value={newAd.location}
                  onChange={(e) => setNewAd({ ...newAd, location: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="City, State"
                />
              </div>
              
              <div>
                <Label htmlFor="image" className="text-gray-300">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <Button
                onClick={handleCreateAd}
                disabled={!newAd.title || !newAd.description || !newAd.category || createAdMutation.isPending}
                className="w-full neon-gradient"
              >
                {createAdMutation.isPending ? "Creating..." : "Post Advertisement"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search advertisements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all" className="text-white">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category} className="text-white">
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Advertisements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {advertisements.map((ad: Advertisement) => (
          <Card key={ad.id} className="bg-gray-800 border-gray-700 hover:border-neon-blue transition-colors">
            {ad.imageUrl && (
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-white text-lg">{ad.title}</h3>
                {ad.price && (
                  <span className="text-neon-orange font-bold">₦{parseFloat(ad.price).toLocaleString()}</span>
                )}
              </div>
              
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{ad.description}</p>
              
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="bg-gray-700 text-gray-300 border-gray-600">
                  {ad.category}
                </Badge>
                {ad.location && (
                  <span className="text-gray-500 text-xs">{ad.location}</span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">
                  {formatDistanceToNow(new Date(ad.createdAt), { addSuffix: true })}
                </span>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleLike(ad.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Heart className="w-4 h-4" />
                    <span className="ml-1 text-xs">{ad.likes}</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleShare(ad.id)}
                    className="text-gray-400 hover:text-blue-500 p-1"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="ml-1 text-xs">{ad.shares}</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-green-500 p-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="ml-1 text-xs">{ad.comments}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {advertisements.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No advertisements found</div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="neon-gradient">
            <Plus className="w-4 h-4 mr-2" />
            Post the first ad
          </Button>
        </div>
      )}
    </div>
  );
}