import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Search, 
  Briefcase, 
  MessageCircle, 
  User,
  ShoppingBag
} from "lucide-react";

export default function BottomNav() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/services", icon: Search, label: "Search" },
    { path: "/gigs", icon: Briefcase, label: "Gigs" },
    { path: "/advertisements", icon: ShoppingBag, label: "Market" },
    { path: "/chat", icon: MessageCircle, label: "Chat", badge: unreadCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card-bg border-t border-gray-800 px-4 py-3 z-50">
      <div className="flex items-center justify-around">
        {navItems.map(({ path, icon: Icon, label, badge }) => {
          const isActive = location === path;
          return (
            <Button
              key={path}
              variant="ghost"
              size="sm"
              onClick={() => setLocation(path)}
              className={`flex flex-col items-center space-y-1 p-2 relative ${
                isActive 
                  ? "text-neon-orange" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{label}</span>
              {badge && badge > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {badge > 9 ? '9+' : badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}