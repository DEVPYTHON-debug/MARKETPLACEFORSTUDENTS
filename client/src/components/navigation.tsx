import { Button } from "@/components/ui/button";
import { TrendingUp, Bell, User } from "lucide-react";

export default function Navigation() {
  return (
    <header className="sticky top-0 z-50 bg-glass-bg backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 neon-gradient rounded-lg flex items-center justify-center shadow-neon-orange">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold neon-gradient-text">Si-link</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800 rounded-lg">
              <Bell className="w-5 h-5" />
            </Button>
            <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-orange rounded-full"></span>
            </Button>
            <div className="w-8 h-8 neon-gradient rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
