import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import ServiceCard from "@/components/service-card";
import BottomNav from "@/components/bottom-nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, Plus, Briefcase } from "lucide-react";

const categories = [
  "All",
  "Tutoring",
  "Food Delivery",
  "Tech Support",
  "Laundry",
  "Transportation",
  "Photography",
  "Design",
  "Writing",
];

export default function Services() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["/api/services", { 
      search: searchQuery || undefined, 
      category: selectedCategory !== "All" ? selectedCategory : undefined 
    }],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg pb-20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold neon-gradient-text mb-2">
            Discover Services
          </h1>
          <p className="text-gray-400">
            Find the perfect service provider for your needs
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-card-bg border-gray-800">
          <CardContent className="p-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border-gray-700 rounded-xl pl-12 focus:border-neon-blue focus:shadow-neon-blue"
              />
              <Search className="w-5 h-5 absolute left-4 top-3 text-gray-400" />
            </div>

            {/* Category Filters */}
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

            {/* Filter Button */}
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" className="border-gray-700">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
              <span className="text-gray-400 text-sm">
                {services.length} services found
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-card-bg border-gray-800 animate-pulse">
                <div className="w-full h-48 bg-gray-800 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-800 rounded mb-2"></div>
                  <div className="h-3 bg-gray-800 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-800 rounded w-20"></div>
                    <div className="h-8 bg-gray-800 rounded w-24"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service: any) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <Card className="bg-card-bg border-gray-800">
            <CardContent className="p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No services found
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || selectedCategory !== "All"
                  ? "Try adjusting your search or filters"
                  : "Be the first to create a service!"}
              </p>
              <Button 
                className="neon-gradient"
                onClick={() => window.location.href = "/create-service"}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Service
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Load More */}
        {services.length > 0 && services.length % 9 === 0 && (
          <div className="text-center">
            <Button variant="outline" className="border-gray-700 hover:border-neon-blue">
              Load More Services
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
