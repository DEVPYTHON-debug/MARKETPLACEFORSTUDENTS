import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import BottomNav from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Briefcase, 
  ArrowLeft,
  Plus,
  Calendar,
  DollarSign,
  Upload,
  X
} from "lucide-react";

const categories = [
  "Design",
  "Development", 
  "Writing",
  "Marketing",
  "Video",
  "Music",
  "Programming",
  "Tutoring",
  "Other"
];

export default function CreateGig() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const createGigMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/gigs", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create gig");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Gig posted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gigs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-gigs"] });
      setLocation("/gigs");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create gig",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !category || !budget.trim() || !deadline) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      toast({
        title: "Invalid Deadline",
        description: "Deadline must be in the future",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category);
    formData.append('budget', budget.trim());
    formData.append('deadline', deadline);
    
    if (selectedImage) {
      formData.append('image', selectedImage);
    }
    
    createGigMutation.mutate(formData);
  };

  const formatBudgetExample = (input: string) => {
    if (!input) return "e.g., ₦5,000 - ₦8,000";
    return input;
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg pb-20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/gigs")}
            className="p-2 hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Post New Gig</h1>
        </div>

        <Card className="bg-card-bg border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-neon-orange" />
              Gig Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">
                Gig Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Need a Logo Design for My Startup"
                className="bg-gray-900 border-gray-700 focus:border-neon-blue focus:shadow-neon-blue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">
                Description *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you need done in detail..."
                rows={4}
                className="bg-gray-900 border-gray-700 focus:border-neon-blue focus:shadow-neon-blue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-300">
                Category *
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-gray-900 border-gray-700 focus:border-neon-blue">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-gray-300">
                  Budget Range *
                </Label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="₦5,000 - ₦8,000"
                    className="bg-gray-900 border-gray-700 pl-10 focus:border-neon-blue focus:shadow-neon-blue"
                  />
                </div>
                <p className="text-gray-500 text-xs">
                  Example: ₦5,000 - ₦8,000 or ₦10,000 fixed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-gray-300">
                  Deadline *
                </Label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="bg-gray-900 border-gray-700 pl-10 focus:border-neon-blue focus:shadow-neon-blue"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-gray-300">
                Gig Image (Optional)
              </Label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-700"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-neon-blue transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Upload an image for your gig</p>
                  <p className="text-gray-500 text-sm mb-4">PNG, JPG, GIF up to 5MB</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="border-gray-700 hover:border-neon-blue"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <div className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">Tips for Better Results</h4>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• Be specific about your requirements</li>
                <li>• Set a realistic budget and timeline</li>
                <li>• Include examples or references if possible</li>
                <li>• Respond quickly to questions from bidders</li>
              </ul>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={() => setLocation("/gigs")}
                variant="outline"
                className="flex-1 border-gray-700 hover:border-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createGigMutation.isPending}
                className="flex-1 neon-gradient hover:shadow-neon-orange transition-all"
              >
                {createGigMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {createGigMutation.isPending ? "Posting..." : "Post Gig"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}