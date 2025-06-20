import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Calendar, DollarSign, Users } from "lucide-react";

interface GigCardProps {
  gig: {
    id: string;
    title: string;
    description: string;
    budget: string;
    deadline: string;
    status: string;
    bidCount: number;
    category: string;
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

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <Card className="bg-card-bg border-gray-800 hover:border-neon-orange transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-semibold text-white">{gig.title}</h4>
              <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700 text-xs">
                {gig.category}
              </Badge>
            </div>
            
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
              {gig.description}
            </p>
            
            <div className="flex items-center space-x-4 text-sm mb-3">
              <div className="flex items-center space-x-1 text-neon-orange">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium">{gig.budget}</span>
              </div>
              
              <div className="flex items-center space-x-1 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Due: {formatDeadline(gig.deadline)}</span>
              </div>
              
              <Badge 
                variant="outline" 
                className={getStatusColor(gig.status)}
              >
                {gig.status === 'open' ? `${gig.bidCount} Bids` : gig.status.replace('_', ' ')}
              </Badge>
            </div>

            {gig.client && !isOwner && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <div className="w-5 h-5 bg-neon-blue rounded-full flex items-center justify-center text-xs text-white">
                  {gig.client.firstName?.[0] || '?'}
                </div>
                <span>
                  {gig.client.firstName} {gig.client.lastName}
                </span>
                {gig.client.isVerified && (
                  <Badge className="bg-green-500 text-white text-xs px-1 py-0">
                    ✓
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-2 ml-4">
            {showBidButton && gig.status === 'open' && (
              <Button size="sm" className="neon-gradient">
                Place Bid
              </Button>
            )}
            
            {isOwner && (
              <div className="flex flex-col space-y-1">
                <Button size="sm" variant="outline" className="border-gray-700 text-xs">
                  View Bids ({gig.bidCount})
                </Button>
                <Button size="sm" variant="outline" className="border-gray-700 text-xs">
                  Edit
                </Button>
              </div>
            )}
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-neon-blue hover:text-neon-yellow p-1"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
