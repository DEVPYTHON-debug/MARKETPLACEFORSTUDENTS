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
                {showBidButton && (
                  <Button size="sm" className="neon-gradient flex-1">
                    Place Bid
                  </Button>
                )}
                
                {isOwner && (
                  <Button size="sm" variant="outline" className="border-gray-700 hover:border-neon-blue">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Manage
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
