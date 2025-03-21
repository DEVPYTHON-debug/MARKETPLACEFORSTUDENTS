import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import BottomNav from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Star, 
  Shield, 
  Wallet, 
  Settings,
  Edit3,
  LogOut,
  TrendingUp,
  DollarSign,
  Briefcase,
  MessageCircle
} from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (user && user.isBanned) {
      toast({
        title: "Account Suspended",
        description: "Your account has been suspended. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    if (user && !user.isVerified) {
      toast({
        title: "Email Verification Required",
        description: "Please verify your email to access all features.",
        variant: "warning",
      });
    }

    if (isUnauthorizedError(user)) {
      toast({
        title: "Authorization Error",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
      return;
    }
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg pb-20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card className="bg-card-bg border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-24 h-24 neon-gradient rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {user?.firstName?.[0] || user?.email?.[0] || '?'}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.email || 'User'}
                </h1>
                <p className="text-gray-400 mb-3 capitalize">
                  {user?.role || 'Student'}
                </p>
                <div className="flex items-center space-x-2 mb-4">
                  {user?.isVerified && (
                    <Badge className="bg-green-500 text-white">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {user?.isPremium && (
                    <Badge className="bg-neon-blue bg-opacity-20 text-neon-blue border-neon-blue border-opacity-30">
                      Premium
                    </Badge>
                  )}
                  <Badge className="bg-neon-orange bg-opacity-20 text-neon-orange border-neon-orange border-opacity-30">
                    App User
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</span>
                  <span>•</span>
                  <span>{user?.email}</span>
                </div>
              </div>
              <Button 
                size="sm" 
                className="neon-gradient"
                onClick={() => window.location.href = "/edit-profile"}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <div className="text-2xl font-bold text-neon-orange mb-1">
                  {user?.completedOrders || 0}
                </div>
                <div className="text-xs text-gray-400">Completed Orders</div>
              </div>
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <div className="text-2xl font-bold text-neon-blue mb-1">
                  {parseFloat(user?.rating || '0').toFixed(1)}
                </div>
                <div className="text-xs text-gray-400">Rating</div>
              </div>
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <div className="text-2xl font-bold text-neon-yellow mb-1">
                  ₦{parseFloat(user?.totalEarnings || '0').toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Total Earnings</div>
              </div>
              <div className="text-center p-4 bg-gray-900 rounded-lg">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  ₦{parseFloat(user?.walletBalance || '0').toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Wallet Balance</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card-bg border border-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-neon-blue data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-neon-orange data-[state=active]:text-white">
              Services
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black">
              Reviews
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-card-bg border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-neon-orange" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 bg-gray-900 rounded">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <div className="text-sm">
                        <p className="text-white">Payment received</p>
                        <p className="text-gray-400 text-xs">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-gray-900 rounded">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <div className="text-sm">
                        <p className="text-white">New 5-star review</p>
                        <p className="text-gray-400 text-xs">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-gray-900 rounded">
                      <Briefcase className="w-4 h-4 text-neon-blue" />
                      <div className="text-sm">
                        <p className="text-white">Order completed</p>
                        <p className="text-gray-400 text-xs">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-card-bg border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-neon-blue" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-gray-900 hover:bg-gray-800">
                    <Wallet className="w-4 h-4 mr-2" />
                    Manage Wallet
                  </Button>
                  <Button className="w-full justify-start bg-gray-900 hover:bg-gray-800">
                    <Briefcase className="w-4 h-4 mr-2" />
                    View Orders
                  </Button>
                  <Button className="w-full justify-start bg-gray-900 hover:bg-gray-800">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                  </Button>
                  <Button className="w-full justify-start bg-gray-900 hover:bg-gray-800">
                    <Shield className="w-4 h-4 mr-2" />
                    Security Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card className="bg-card-bg border-gray-800">
              <CardContent className="p-12 text-center">
                <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No services yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Create your first service to start earning
                </p>
                <Button 
                  className="neon-gradient"
                  onClick={() => window.location.href = "/create-service"}
                >
                  Create Service
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="bg-card-bg border-gray-800">
              <CardContent className="p-12 text-center">
                <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No reviews yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Complete your first order to receive reviews
                </p>
                <Button 
                  className="neon-gradient"
                  onClick={() => window.location.href = "/services"}
                >
                  Browse Services
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-card-bg border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                  <div>
                    <p className="text-white font-medium">Profile Visibility</p>
                    <p className="text-gray-400 text-sm">Control who can see your profile</p>
                  </div>
                  <Badge>Public</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-gray-400 text-sm">Receive updates via email</p>
                  </div>
                  <Badge className="bg-green-500">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                  <div>
                    <p className="text-white font-medium">Two-Factor Authentication</p>
                    <p className="text-gray-400 text-sm">Extra security for your account</p>
                  </div>
                  <Badge variant="outline">Disabled</Badge>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => window.location.href = "/api/logout"}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
