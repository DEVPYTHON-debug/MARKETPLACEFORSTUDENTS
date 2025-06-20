import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import ServiceCard from "@/components/service-card";
import GigCard from "@/components/gig-card";
import BottomNav from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Star, 
  Wallet, 
  TrendingUp,
  MessageCircle,
  Zap,
  DollarSign,
  Users,
  Briefcase
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
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

  const { data: services = [] } = useQuery({
    queryKey: ["/api/services?limit=6"],
    enabled: isAuthenticated,
  });

  const { data: userGigs = [] } = useQuery({
    queryKey: ["/api/my-gigs"],
    enabled: isAuthenticated,
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: isAuthenticated,
  });

  const { data: recentTransactions = [] } = useQuery({
    queryKey: ["/api/transactions?limit=5"],
    enabled: isAuthenticated,
  });

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
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Welcome Section */}
        <section className="text-center py-8">
          <div className="floating-animation">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="neon-gradient-text">
                Welcome to Si-link
              </span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
              Connecting Students with Local Services – Seamlessly and Intelligently
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <Card className="bg-card-bg border-gray-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-neon-orange">250+</div>
                <div className="text-xs text-gray-400">Active Services</div>
              </CardContent>
            </Card>
            <Card className="bg-card-bg border-gray-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-neon-blue">1.2K</div>
                <div className="text-xs text-gray-400">Students</div>
              </CardContent>
            </Card>
            <Card className="bg-card-bg border-gray-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-neon-yellow">180+</div>
                <div className="text-xs text-gray-400">Providers</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Search Section */}
        <section className="bg-card-bg rounded-2xl p-6 border border-gray-800 shadow-lg">
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search for services, gigs, or providers..."
                className="w-full bg-gray-900 border-gray-700 rounded-xl pl-12 focus:border-neon-blue focus:shadow-neon-blue"
              />
              <Search className="w-5 h-5 absolute left-4 top-3 text-gray-400" />
            </div>
            
            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-neon-orange bg-opacity-20 text-neon-orange border-neon-orange border-opacity-30 glow-effect">
                All Categories
              </Badge>
              <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700 glow-effect">
                Tutoring
              </Badge>
              <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700 glow-effect">
                Food Delivery
              </Badge>
              <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700 glow-effect">
                Tech Support
              </Badge>
            </div>
          </div>
        </section>

        {/* Featured Services */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Featured Services</h3>
            <Button variant="link" className="text-neon-blue hover:text-neon-yellow">
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.length > 0 ? (
              services.map((service: any) => (
                <ServiceCard key={service.id} service={service} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No services available</p>
                <p className="text-gray-500 text-sm">Be the first to create a service!</p>
              </div>
            )}
          </div>
        </section>

        {/* User Dashboard */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Card */}
          <Card className="bg-card-bg border-gray-800">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 text-white">Your Profile</h3>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 neon-gradient rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {user?.firstName?.[0] || user?.email?.[0] || '?'}
                </div>
                <div>
                  <h4 className="font-semibold text-white">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.email || 'User'}
                  </h4>
                  <p className="text-gray-400 text-sm capitalize">
                    {user?.role || 'Student'}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {user?.isVerified && (
                      <Badge className="bg-green-500 text-white text-xs">
                        Verified
                      </Badge>
                    )}
                    {user?.isPremium && (
                      <Badge className="bg-neon-blue bg-opacity-20 text-neon-blue border-neon-blue border-opacity-30 text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-orange">
                    {userStats?.completedOrders || user?.completedOrders || 0}
                  </div>
                  <div className="text-xs text-gray-400">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-blue">
                    {parseFloat(userStats?.averageRating || user?.rating || '0').toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400">Rating</div>
                </div>
              </div>
              
              <Button 
                className="w-full neon-gradient hover:shadow-neon-orange transition-all"
                onClick={() => window.location.href = "/edit-profile"}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Wallet Card */}
          <Card className="bg-card-bg border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Wallet</h3>
                <Button size="sm" variant="ghost" className="text-neon-blue hover:text-neon-yellow">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="neon-gradient rounded-xl p-4 mb-6">
                <div className="text-white text-sm mb-1">Available Balance</div>
                <div className="text-white text-3xl font-bold">
                  ₦{parseFloat(user?.walletBalance || '0').toLocaleString()}
                </div>
                <div className="text-white text-xs opacity-75 mt-2">
                  Virtual Account: 2039482819
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="bg-green-600 hover:bg-green-700 transition-colors"
                  onClick={() => window.location.href = "/add-money"}
                >
                  Add Money
                </Button>
                <Button variant="secondary" className="bg-gray-700 hover:bg-gray-600">
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Active Gigs */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Active Gigs</h3>
            <Button 
              className="neon-gradient hover:shadow-neon-blue transition-all"
              onClick={() => window.location.href = "/create-gig"}
            >
              <Plus className="w-4 h-4 mr-2" />
              Post New Gig
            </Button>
          </div>
          
          <div className="space-y-4">
            {userGigs.length > 0 ? (
              userGigs.slice(0, 3).map((gig: any) => (
                <GigCard key={gig.id} gig={gig} />
              ))
            ) : (
              <Card className="bg-card-bg border-gray-800">
                <CardContent className="p-8 text-center">
                  <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No active gigs</p>
                  <p className="text-gray-500 text-sm mb-4">Start earning by posting your first gig!</p>
                  <Button 
                    className="neon-gradient"
                    onClick={() => window.location.href = "/create-gig"}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Gig
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h3 className="text-2xl font-bold text-white mb-6">Recent Activity</h3>
          <Card className="bg-card-bg border-gray-800">
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center space-x-4 p-3 hover:bg-gray-800 rounded-lg transition-colors">
                      <div className="w-10 h-10 bg-neon-orange bg-opacity-20 rounded-full flex items-center justify-center">
                        {transaction.type === 'credit' || transaction.type === 'deposit' ? (
                          <TrendingUp className="w-5 h-5 text-neon-orange" />
                        ) : (
                          <DollarSign className="w-5 h-5 text-neon-blue" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{transaction.description}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`font-medium text-sm ${
                        transaction.type === 'credit' || transaction.type === 'deposit' 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {transaction.type === 'credit' || transaction.type === 'deposit' ? '+' : '-'}
                        ₦{parseFloat(transaction.amount).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Floating Action Button */}
      <Button className="fixed right-6 bottom-20 w-14 h-14 neon-gradient rounded-full shadow-neon-orange hover:shadow-neon-blue transition-all glow-effect floating-animation">
        <Plus className="w-6 h-6" />
      </Button>

      <BottomNav />
    </div>
  );
}
