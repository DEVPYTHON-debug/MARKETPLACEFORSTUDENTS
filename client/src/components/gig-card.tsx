import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Calendar, DollarSign, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface GigCardProps {
  gig: {
    id: string;
    clientId: string;
    title: string;
    description: string;
    budget: string;
    deadline: string;
    status: string;
    bidCount: number;
    category: string;
    imageUrl?: string;
    client?: {
      firstName?: string;
      lastName?: string;
      isVerified?: boolean;
    };
  };
  showBidButton?: boolean;
  isOwner?: boolean;
}

export default function GigCard({ gig, showBidButton = false, isOwner = false }: GigCardProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [bidDescription, setBidDescription] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  
  // Check if the current user is the owner of this gig
  const isGigOwner = user?.id === gig.clientId;

  const placeBidMutation = useMutation({
    mutationFn: async (bidData: { amount: string; message: string; deliveryTime: string }) => {
      if (!user) throw new Error('Please log in to place bids');
      
      return apiRequest("POST", "/api/bids", {
        gigId: gig.id,
        bidderId: user.id,
        amount: bidData.amount,
        message: bidData.message,
        deliveryTime: bidData.deliveryTime
      });
    },
    onSuccess: () => {
      toast({
        title: "Bid Submitted!",
        description: "Your bid has been submitted successfully.",
      });
      setIsDialogOpen(false);
      setBidAmount("");
      setBidDescription("");
      setDeliveryTime("");
      queryClient.invalidateQueries({ queryKey: ["/api/gigs"] });
    },
    onError: (error: any) => {
      toast({
        title: "Bid Failed",
        description: error.message || "Failed to submit bid. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startChatMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/chats/start", {
        receiverId: gig.clientId,
        gigId: gig.id,
      });
    },
    onSuccess: (chat) => {
      setLocation("/chat");
      toast({
        title: "Chat Started",
        description: "You can now message the gig poster.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Start Chat",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartChat = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to start a chat.",
        variant: "destructive",
      });
      return;
    }
    startChatMutation.mutate();
  };

  const formatDeadline = (deadline: string) => {
    try {
      return formatDistanceToNow(new Date(deadline), { addSuffix: true });
    } catch {
      return deadline;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500 bg-opacity-20 text-green-400 border-green-500';
      case 'in_progress':
        return 'bg-yellow-500 bg-opacity-20 text-yellow-400 border-yellow-500';
      case 'completed':
        return 'bg-blue-500 bg-opacity-20 text-blue-400 border-blue-500';
      case 'cancelled':
        return 'bg-red-500 bg-opacity-20 text-red-400 border-red-500';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-400 border-gray-500';
    }
  };

  return (
    <Card className="bg-card-bg border-gray-800 hover:border-neon-orange transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 neon-gradient rounded-lg flex items-center justify-center text-white font-bold overflow-hidden">
            {gig.imageUrl ? (
              <img
                src={gig.imageUrl}
                alt={gig.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              gig.title[0]
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-white pr-2">{gig.title}</h4>
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-1 border ${getStatusColor(gig.status)}`}
              >
                {gig.status.replace('_', ' ')}
              </Badge>
            </div>
            
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
              {gig.description}
            </p>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4 text-neon-orange" />
                  <span className="text-white font-medium">{gig.budget}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">{formatDeadline(gig.deadline)}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">{gig.bidCount} bids</span>
                </div>
              </div>
            </div>
            
            {(showBidButton || isOwner) && (
              <div className="flex items-center space-x-2 mt-4">
                {showBidButton && !isGigOwner && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="neon-gradient flex-1">
                        Place Bid
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Place Your Bid</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bidAmount" className="text-gray-300">
                            Bid Amount (₦)
                          </Label>
                          <Input
                            id="bidAmount"
                            type="number"
                            placeholder="Enter your bid amount"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bidDescription" className="text-gray-300">
                            Proposal Description
                          </Label>
                          <Textarea
                            id="bidDescription"
                            placeholder="Describe your approach and why you're the best fit..."
                            value={bidDescription}
                            onChange={(e) => setBidDescription(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="deliveryTime" className="text-gray-300">
                            Delivery Time
                          </Label>
                          <Input
                            id="deliveryTime"
                            placeholder="e.g., 3 days, 1 week"
                            value={deliveryTime}
                            onChange={(e) => setDeliveryTime(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => placeBidMutation.mutate({
                              amount: bidAmount,
                              message: bidDescription,
                              deliveryTime: deliveryTime
                            })}
                            disabled={!bidAmount || !bidDescription || !deliveryTime || placeBidMutation.isPending}
                            className="neon-gradient flex-1"
                          >
                            {placeBidMutation.isPending ? "Submitting..." : "Submit Bid"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="border-gray-700"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                
                {(isOwner || isGigOwner) && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-gray-700 hover:border-neon-blue"
                    onClick={() => setLocation(`/manage-gig/${gig.id}`)}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Manage
                  </Button>
                )}
                
                {showBidButton && !isGigOwner && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-gray-700 hover:border-neon-green"
                    onClick={handleStartChat}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
