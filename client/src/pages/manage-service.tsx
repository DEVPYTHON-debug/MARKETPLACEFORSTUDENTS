import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Edit, Trash2, DollarSign, Star, MapPin } from "lucide-react";

export default function ManageService() {
  const { serviceId } = useParams();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    price: "",
    priceType: "fixed",
    category: "",
    tags: ""
  });

  const { data: service, isLoading } = useQuery({
    queryKey: ["/api/services", serviceId],
    queryFn: async () => {
      const response = await fetch(`/api/services/${serviceId}`);
      if (!response.ok) throw new Error("Failed to fetch service");
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof editData) => {
      return apiRequest(`/api/services/${serviceId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Success", description: "Service updated successfully" });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update service", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/services/${serviceId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Success", description: "Service deleted successfully" });
      setLocation("/services");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete service", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!service || service.providerId !== user?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You don't have permission to manage this service.</p>
            <Button onClick={() => setLocation("/services")}>Back to Services</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEdit = () => {
    setEditData({
      title: service.title,
      description: service.description,
      price: service.price,
      priceType: service.priceType,
      category: service.category,
      tags: service.tags?.join(", ") || ""
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    const dataToSend = {
      ...editData,
      tags: editData.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
    };
    updateMutation.mutate(dataToSend);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const categories = [
    "Academic", "Food & Delivery", "Transportation", "Tech Support", 
    "Tutoring", "Events", "Cleaning", "Design", "Writing", "Other"
  ];

  const priceTypes = [
    { value: "fixed", label: "Fixed Price" },
    { value: "hourly", label: "Per Hour" },
    { value: "negotiable", label: "Negotiable" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/services")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Button>
        
        <div className="flex gap-2">
          {!isEditing && (
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Service
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Service
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Service</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your service and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    value={editData.price}
                    onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                    placeholder="e.g., $50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="priceType">Price Type</Label>
                  <Select value={editData.priceType} onValueChange={(value) => setEditData({ ...editData, priceType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={editData.category} onValueChange={(value) => setEditData({ ...editData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={editData.tags}
                    onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                    placeholder="e.g., programming, web development, react"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-xl font-semibold">{service.title}</h3>
                  <p className="text-gray-600 mt-2">{service.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-neon-green" />
                    <span className="font-medium">{service.price}</span>
                    <Badge variant="secondary">{service.priceType}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{service.rating || 'No ratings'}</span>
                    <span className="text-gray-500">({service.reviewCount || 0} reviews)</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{service.category}</Badge>
                  <div className="flex gap-1">
                    {service.tags?.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Service Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Service Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border border-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-neon-blue">{service.reviewCount || 0}</div>
                <div className="text-sm text-gray-500">Total Reviews</div>
              </div>
              <div className="text-center p-4 border border-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-neon-green">{service.rating || '0.0'}</div>
                <div className="text-sm text-gray-500">Average Rating</div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <h4 className="font-medium mb-2">Service Created:</h4>
              <p className="text-gray-500">
                {new Date(service.createdAt).toLocaleDateString()} at{' '}
                {new Date(service.createdAt).toLocaleTimeString()}
              </p>
            </div>
            
            {service.updatedAt && service.updatedAt !== service.createdAt && (
              <div>
                <h4 className="font-medium mb-2">Last Updated:</h4>
                <p className="text-gray-500">
                  {new Date(service.updatedAt).toLocaleDateString()} at{' '}
                  {new Date(service.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-700">
              <h4 className="font-medium mb-2">Performance Tips:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Add high-quality images to attract more clients</li>
                <li>• Respond quickly to inquiries</li>
                <li>• Keep your service description updated</li>
                <li>• Collect reviews from satisfied customers</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}