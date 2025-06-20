import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Home, 
  Search, 
  Briefcase, 
  MessageCircle, 
  User 
} from "lucide-react";

export default function BottomNav() {
  const { user } = useAuth();

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/services", icon: Search, label: "Search" },
    { path: "/gigs", icon: Briefcase, label: "Gigs" },
    { path: "/chat", icon: MessageCircle, label: "Chat" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card-bg border-t border-gray-800 px-4 py-3 z-50">
      <div className="flex items-center justify-around">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <Button
              key={path}
              variant="ghost"
              size="sm"
              onClick={() => setLocation(path)}
              className={`flex flex-col items-center space-y-1 p-2 ${
                isActive 
                  ? "text-neon-orange" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
