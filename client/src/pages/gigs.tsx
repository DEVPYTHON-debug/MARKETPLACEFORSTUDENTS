import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import GigCard from "@/components/gig-card";
import BottomNav from "@/components/bottom-nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Plus, Briefcase } from "lucide-react";

const categories = [
  "All",
  "Design",
  "Development", 
  "Writing",
  "Marketing",
  "Video",
  "Music",
  "Programming",
  "Tutoring",
];

export default function Gigs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: allGigs = [] } = useQuery({
    queryKey: ["/api/gigs", { 
      search: searchQuery || undefined, 
      category: selectedCategory !== "All" ? selectedCategory : undefined 
    }],
  });

  const { data: myGigs = [] } = useQuery({
    queryKey: ["/api/my-gigs"],
  });

  const { data: myBids = [] } = useQuery({
    queryKey: ["/api/my-bids"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg pb-20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold neon-gradient-text mb-2">
              Gig Marketplace
            </h1>
            <p className="text-gray-400">
              Find gigs or post your own services
            </p>
          </div>
          <Button className="neon-gradient hover:shadow-neon-blue transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Post Gig
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card-bg border border-gray-800">
            <TabsTrigger value="browse" className="data-[state=active]:bg-neon-blue data-[state=active]:text-white">
              Browse Gigs
            </TabsTrigger>
            <TabsTrigger value="my-gigs" className="data-[state=active]:bg-neon-orange data-[state=active]:text-white">
              My Gigs
            </TabsTrigger>
            <TabsTrigger value="my-bids" className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black">
              My Bids
            </TabsTrigger>
          </TabsList>

          {/* Browse Gigs Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-card-bg border-gray-800">
              <CardContent className="p-6 space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search gigs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-900 border-gray-700 rounded-xl pl-12 focus:border-neon-blue focus:shadow-neon-blue"
                  />
                  <Search className="w-5 h-5 absolute left-4 top-3 text-gray-400" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className={`cursor-pointer glow-effect ${
                        selectedCategory === category
                          ? "bg-neon-blue bg-opacity-20 text-neon-blue border-neon-blue border-opacity-30"
                          : "bg-gray-800 text-gray-300 border-gray-700 hover:border-neon-blue"
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm" className="border-gray-700">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                  <span className="text-gray-400 text-sm">
                    {allGigs.length} gigs available
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Gigs List */}
            {allGigs.length > 0 ? (
              <div className="space-y-4">
                {allGigs.map((gig: any) => (
                  <GigCard key={gig.id} gig={gig} showBidButton />
                ))}
              </div>
            ) : (
              <Card className="bg-card-bg border-gray-800">
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No gigs available
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Be the first to post a gig!
                  </p>
                  <Button className="neon-gradient">
                    <Plus className="w-4 h-4 mr-2" />
                    Post First Gig
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Gigs Tab */}
          <TabsContent value="my-gigs" className="space-y-6">
            {myGigs.length > 0 ? (
              <div className="space-y-4">
                {myGigs.map((gig: any) => (
                  <GigCard key={gig.id} gig={gig} isOwner />
                ))}
              </div>
            ) : (
              <Card className="bg-card-bg border-gray-800">
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No gigs posted yet
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Start earning by posting your first gig!
                  </p>
                  <Button className="neon-gradient">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Gig
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Bids Tab */}
          <TabsContent value="my-bids" className="space-y-6">
            {myBids.length > 0 ? (
              <div className="space-y-4">
                {myBids.map((bid: any) => (
                  <Card key={bid.id} className="bg-card-bg border-gray-800 hover:border-neon-yellow transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-2">
                            Bid for: {bid.gig?.title || "Unknown Gig"}
                          </h4>
                          <p className="text-gray-400 text-sm mb-3">
                            {bid.message}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-neon-yellow font-medium">
                              ₦{parseFloat(bid.amount).toLocaleString()}
                            </span>
                            <span className="text-gray-400">
                              Delivery: {bid.deliveryTime}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`${
                                bid.status === 'accepted' ? 'bg-green-500 bg-opacity-20 text-green-400 border-green-500' :
                                bid.status === 'rejected' ? 'bg-red-500 bg-opacity-20 text-red-400 border-red-500' :
                                'bg-yellow-500 bg-opacity-20 text-yellow-400 border-yellow-500'
                              }`}
                            >
                              {bid.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card-bg border-gray-800">
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No bids submitted
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Start bidding on gigs to find work!
                  </p>
                  <Button 
                    className="neon-gradient"
                    onClick={() => {
                      const browseTrigger = document.querySelector('[value="browse"]') as HTMLElement;
                      browseTrigger?.click();
                    }}
                  >
                    Browse Gigs
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
