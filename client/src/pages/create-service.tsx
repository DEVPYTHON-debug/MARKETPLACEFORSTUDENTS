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
  DollarSign
} from "lucide-react";

const categories = [
  "Tutoring",
  "Food Delivery", 
  "Tech Support",
  "Laundry",
  "Transportation",
  "Photography",
  "Design",
  "Writing",
  "Other"
];

export default function CreateService() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("fixed");

  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/services", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Service created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-services"] });
      setLocation("/services");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create service",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !category || !price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    createServiceMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      category,
      price: priceValue.toString(),
      priceType,
      tags: []
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg pb-20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/services")}
            className="p-2 hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Create Service</h1>
        </div>

        <Card className="bg-card-bg border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-neon-orange" />
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">
                Service Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Math Tutoring for University Students"
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
                placeholder="Describe your service in detail..."
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
                <Label htmlFor="price" className="text-gray-300">
                  Price (₦) *
                </Label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1000"
                    className="bg-gray-900 border-gray-700 pl-10 focus:border-neon-blue focus:shadow-neon-blue"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceType" className="text-gray-300">
                  Price Type
                </Label>
                <Select value={priceType} onValueChange={setPriceType}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 focus:border-neon-blue">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="hourly">Per Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-lg p-4">
              <h4 className="text-yellow-300 font-medium mb-2">Service Guidelines</h4>
              <ul className="text-yellow-300 text-sm space-y-1">
                <li>• Provide accurate and detailed service descriptions</li>
                <li>• Set competitive and fair pricing</li>
                <li>• Respond promptly to client inquiries</li>
                <li>• Deliver quality work on time</li>
              </ul>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={() => setLocation("/services")}
                variant="outline"
                className="flex-1 border-gray-700 hover:border-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createServiceMutation.isPending}
                className="flex-1 neon-gradient hover:shadow-neon-orange transition-all"
              >
                {createServiceMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {createServiceMutation.isPending ? "Creating..." : "Create Service"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}