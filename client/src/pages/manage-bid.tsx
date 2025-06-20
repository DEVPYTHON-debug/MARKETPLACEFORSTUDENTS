import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Edit, Trash2, DollarSign, Calendar, FileText } from "lucide-react";

export default function ManageBid() {
  const { bidId } = useParams();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  const [editData, setEditData] = useState({
    amount: "",
    proposal: "",
    deliveryTime: ""
  });

  const { data: bid, isLoading } = useQuery({
    queryKey: ["/api/bids", bidId],
    queryFn: async () => {
      const response = await fetch(`/api/bids/${bidId}`);
      if (!response.ok) throw new Error("Failed to fetch bid");
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof editData) => {
      return apiRequest("PATCH", `/api/bids/${bidId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bids"] });
      toast({ title: "Success", description: "Bid updated successfully" });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update bid", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/bids/${bidId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bids"] });
      toast({ title: "Success", description: "Bid withdrawn successfully" });
      setLocation("/gigs");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to withdraw bid", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!bid || bid.bidderId !== user?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You don't have permission to manage this bid.</p>
            <Button onClick={() => setLocation("/gigs")}>Back to Gigs</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEdit = () => {
    setEditData({
      amount: bid.amount,
      proposal: bid.proposal,
      deliveryTime: bid.deliveryTime || ""
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const canEdit = bid.status === 'pending';

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
        
        {canEdit && (
          <div className="flex gap-2">
            {!isEditing && (
              <Button onClick={handleEdit} className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Bid
              </Button>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Withdraw Bid
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Withdraw Bid</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently withdraw your bid from this gig.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                    Withdraw
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bid Details */}
        <Card>
          <CardHeader>
            <CardTitle>Your Bid</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="amount">Bid Amount</Label>
                  <Input
                    id="amount"
                    value={editData.amount}
                    onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                    placeholder="e.g., $100"
                  />
                </div>
                
                <div>
                  <Label htmlFor="proposal">Proposal</Label>
                  <Textarea
                    id="proposal"
                    value={editData.proposal}
                    onChange={(e) => setEditData({ ...editData, proposal: e.target.value })}
                    rows={6}
                    placeholder="Explain why you're the best fit for this gig..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="deliveryTime">Delivery Time</Label>
                  <Input
                    id="deliveryTime"
                    value={editData.deliveryTime}
                    onChange={(e) => setEditData({ ...editData, deliveryTime: e.target.value })}
                    placeholder="e.g., 3 days"
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
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={
                    bid.status === 'pending' ? 'bg-yellow-500' :
                    bid.status === 'accepted' ? 'bg-green-500' :
                    bid.status === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
                  }>
                    {bid.status.toUpperCase()}
                  </Badge>
                  {!canEdit && (
                    <span className="text-sm text-gray-500">
                      {bid.status === 'accepted' ? 'Congratulations! Your bid was accepted.' :
                       bid.status === 'rejected' ? 'Your bid was not selected.' :
                       'This bid cannot be edited.'}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-neon-green" />
                    <span className="font-medium">Bid Amount: {bid.amount}</span>
                  </div>
                  
                  {bid.deliveryTime && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neon-blue" />
                      <span>Delivery Time: {bid.deliveryTime}</span>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-neon-purple mt-1" />
                    <div>
                      <span className="font-medium block">Proposal:</span>
                      <p className="text-gray-600 mt-1">{bid.proposal}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 pt-4 border-t border-gray-700">
                  Submitted on {new Date(bid.createdAt).toLocaleDateString()} at{' '}
                  {new Date(bid.createdAt).toLocaleTimeString()}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Gig Information */}
        <Card>
          <CardHeader>
            <CardTitle>Gig Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{bid.gig?.title}</h3>
              <p className="text-gray-600 mt-2">{bid.gig?.description}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-neon-green" />
                <span>Budget: {bid.gig?.budget}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neon-blue" />
                <span>Deadline: {new Date(bid.gig?.deadline).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{bid.gig?.category}</Badge>
              <Badge className={
                bid.gig?.status === 'open' ? 'bg-green-500' :
                bid.gig?.status === 'in_progress' ? 'bg-yellow-500' :
                bid.gig?.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
              }>
                {bid.gig?.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            {bid.gig?.client && (
              <div className="pt-4 border-t border-gray-700">
                <h4 className="font-medium mb-2">Posted by:</h4>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-neon-gradient flex items-center justify-center text-white text-sm font-bold">
                    {bid.gig.client.firstName?.[0]}{bid.gig.client.lastName?.[0]}
                  </div>
                  <div>
                    <span className="font-medium">
                      {bid.gig.client.firstName} {bid.gig.client.lastName}
                    </span>
                    {bid.gig.client.isVerified && (
                      <Badge className="ml-2 bg-green-500 text-white text-xs">✓</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}