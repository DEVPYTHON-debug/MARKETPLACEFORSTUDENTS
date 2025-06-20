import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import BottomNav from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  BellRing, 
  MessageCircle, 
  DollarSign, 
  Briefcase,
  CheckCircle,
  Clock,
  Star
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'bid_received':
      return <Briefcase className="w-5 h-5 text-neon-orange" />;
    case 'order_update':
      return <CheckCircle className="w-5 h-5 text-neon-green" />;
    case 'payment':
      return <DollarSign className="w-5 h-5 text-neon-yellow" />;
    case 'message':
      return <MessageCircle className="w-5 h-5 text-neon-blue" />;
    case 'review':
      return <Star className="w-5 h-5 text-neon-yellow" />;
    default:
      return <Bell className="w-5 h-5 text-gray-400" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'bid_received':
      return 'border-l-neon-orange';
    case 'order_update':
      return 'border-l-neon-green';
    case 'payment':
      return 'border-l-neon-yellow';
    case 'message':
      return 'border-l-neon-blue';
    case 'review':
      return 'border-l-neon-yellow';
    default:
      return 'border-l-gray-400';
  }
};

export default function Notifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/notifications/mark-all-read", {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg pb-20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <BellRing className="w-8 h-8 text-neon-blue" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Notifications</h1>
              <p className="text-gray-400">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="border-gray-700 hover:border-neon-blue"
            >
              Mark All Read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification: Notification) => (
              <Card 
                key={notification.id} 
                className={`bg-card-bg border-gray-800 border-l-4 ${getNotificationColor(notification.type)} 
                  ${!notification.isRead ? 'bg-opacity-80' : 'bg-opacity-60'} 
                  hover:border-gray-700 transition-all cursor-pointer`}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsReadMutation.mutate(notification.id);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className={`font-semibold ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-neon-blue"></div>
                          )}
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      
                      <p className={`mt-1 text-sm ${!notification.isRead ? 'text-gray-300' : 'text-gray-400'}`}>
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-card-bg border-gray-800">
              <CardContent className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No notifications yet
                </h3>
                <p className="text-gray-400">
                  We'll notify you when something important happens!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}