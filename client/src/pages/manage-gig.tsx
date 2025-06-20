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
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Edit, Trash2, Users, DollarSign, Calendar, MessageCircle } from "lucide-react";

export default function ManageGig() {
  const { gigId } = useParams();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
    category: "",
    status: "open"
  });

  const { data: gig, isLoading } = useQuery({
    queryKey: ["/api/gigs", gigId],
    queryFn: async () => {
      const response = await fetch(`/api/gigs/${gigId}`);
      if (!response.ok) throw new Error("Failed to fetch gig");
      return response.json();
    },
  });

  const { data: bids = [] } = useQuery({
    queryKey: ["/api/gigs", gigId, "bids"],
    queryFn: async () => {
      const response = await fetch(`/api/gigs/${gigId}/bids`);
      if (!response.ok) throw new Error("Failed to fetch bids");
      return response.json();
    },
    enabled: !!gig,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof editData) => {
      return apiRequest("PATCH", `/api/gigs/${gigId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gigs"] });
      toast({ title: "Success", description: "Gig updated successfully" });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update gig", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/gigs/${gigId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gigs"] });
      toast({ title: "Success", description: "Gig deleted successfully" });
      setLocation("/gigs");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete gig", variant: "destructive" });
    },
  });

  const acceptBidMutation = useMutation({
    mutationFn: async (bidId: string) => {
      return apiRequest(`/api/bids/${bidId}/accept`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gigs", gigId, "bids"] });
      toast({ title: "Success", description: "Bid accepted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to accept bid", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!gig || gig.clientId !== user?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You don't have permission to manage this gig.</p>
            <Button onClick={() => setLocation("/gigs")}>Back to Gigs</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEdit = () => {
    setEditData({
      title: gig.title,
      description: gig.description,
      budget: gig.budget,
      deadline: gig.deadline,
      category: gig.category,
      status: gig.status
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleAcceptBid = (bidId: string) => {
    acceptBidMutation.mutate(bidId);
  };

  const categories = [
    "Academic", "Food & Delivery", "Transportation", "Tech Support", 
    "Tutoring", "Events", "Cleaning", "Design", "Writing", "Other"
  ];

  const statuses = [
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/gigs")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gigs
        </Button>
        
        <div className="flex gap-2">
          {!isEditing && (
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Gig
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Gig
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Gig</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your gig and all associated bids.
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
        {/* Gig Details */}
        <Card>
          <CardHeader>
            <CardTitle>Gig Details</CardTitle>
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
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    value={editData.budget}
                    onChange={(e) => setEditData({ ...editData, budget: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={editData.deadline}
                    onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                  />
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
                  <Label htmlFor="status">Status</Label>
                  <Select value={editData.status} onValueChange={(value) => setEditData({ ...editData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <h3 className="text-xl font-semibold">{gig.title}</h3>
                  <p className="text-gray-600 mt-2">{gig.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-neon-green" />
                    <span className="font-medium">{gig.budget}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neon-blue" />
                    <span>{new Date(gig.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{gig.category}</Badge>
                  <Badge className={
                    gig.status === 'open' ? 'bg-green-500' :
                    gig.status === 'in_progress' ? 'bg-yellow-500' :
                    gig.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
                  }>
                    {gig.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bids Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Bids ({bids.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bids.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bids received yet</p>
            ) : (
              <div className="space-y-4">
                {bids.map((bid: any) => (
                  <div key={bid.id} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{bid.bidder?.firstName} {bid.bidder?.lastName}</h4>
                        <p className="text-sm text-gray-500">
                          Rating: {bid.bidder?.rating || 'N/A'} ⭐
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-neon-green">{bid.amount}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(bid.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-3">{bid.proposal}</p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant={bid.status === 'accepted' ? 'default' : 'secondary'}>
                        {bid.status.toUpperCase()}
                      </Badge>
                      
                      {bid.status === 'pending' && gig.status === 'open' && (
                        <Button 
                          size="sm"
                          onClick={() => handleAcceptBid(bid.id)}
                          disabled={acceptBidMutation.isPending}
                        >
                          Accept Bid
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}