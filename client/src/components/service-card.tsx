import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    price: string;
    priceType: string;
    rating: string;
    reviewCount: number;
    category: string;
    imageUrl?: string;
    providerId?: string;
    provider?: {
      id?: string;
      firstName?: string;
      lastName?: string;
      isVerified?: boolean;
    };
  };
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check if the current user is the provider of this service
  const isServiceProvider = user?.id === service.providerId || user?.id === service.provider?.id;

  const bookServiceMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Please log in to book services');
      
      return apiRequest("POST", "/api/orders", {
        serviceId: service.id,
        providerId: service.providerId,
        clientId: user.id,
        amount: service.price,
        type: "service"
      });
    },
    onSuccess: () => {
      toast({
        title: "Service Booked!",
        description: "Your service has been booked successfully. Check your orders for details.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book service. Please try again.",
        variant: "destructive",
      });
    },
  });
  const mockImages = [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
  ];

  const imageUrl = service.imageUrl || mockImages[Math.floor(Math.random() * mockImages.length)];

  return (
    <Card className="bg-card-bg border-gray-800 glow-effect hover:shadow-neon-orange transition-all overflow-hidden">
      <div className="aspect-video bg-gradient-to-r from-neon-blue to-neon-orange flex items-center justify-center overflow-hidden">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white font-bold text-2xl">
            {service.title.split(' ').map(word => word[0]).join('').slice(0, 2)}
          </span>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-white truncate">{service.title}</h4>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-neon-yellow fill-current" />
            <span className="text-sm text-gray-300">
              {parseFloat(service.rating).toFixed(1)}
            </span>
          </div>
        </div>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {service.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-neon-orange font-bold">
              ₦{parseFloat(service.price).toLocaleString()}
            </span>
            {service.priceType === 'hourly' && (
              <span className="text-gray-400 text-sm">/hr</span>
            )}
          </div>
          <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700">
            {service.category}
          </Badge>
        </div>

        {service.provider && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-neon-blue rounded-full flex items-center justify-center text-xs text-white">
                {service.provider.firstName?.[0] || '?'}
              </div>
              <span className="text-gray-300 text-sm">
                {service.provider.firstName} {service.provider.lastName}
              </span>
              {service.provider.isVerified && (
                <Badge className="bg-green-500 text-white text-xs px-1 py-0">
                  ✓
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {!isServiceProvider && (
          <Button 
            className="w-full neon-gradient hover:shadow-neon-orange transition-all"
            onClick={() => bookServiceMutation.mutate()}
            disabled={bookServiceMutation.isPending}
          >
            {bookServiceMutation.isPending ? "Booking..." : "Book Now"}
          </Button>
        )}
        {isServiceProvider && (
          <Button 
            variant="outline" 
            className="w-full border-gray-700 hover:border-neon-orange"
            onClick={() => setLocation(`/manage-service/${service.id}`)}
          >
            Manage Service
          </Button>
        )}
        
        {!isServiceProvider && (
          <div className="flex space-x-2 mt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 border-gray-700 hover:border-neon-blue"
            >
              Chat
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
