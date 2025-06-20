import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, 
  Users, 
  Shield, 
  Briefcase,
  Star,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function Splash() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Show loading only briefly on initial load when still checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-neon-blue to-neon-orange animate-pulse"></div>
            <Zap className="w-12 h-12 absolute top-4 left-1/2 transform -translate-x-1/2 text-white animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold neon-gradient-text animate-fade-in">
            Si-link
          </h1>
          <p className="text-gray-400 animate-fade-in-delay">
            Connecting students with opportunities
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold neon-gradient-text mb-6">
              Si-link
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              The ultimate marketplace connecting students with local service providers
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Discover services, post gigs, earn money, and build your professional reputation
              within your student community.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="neon-gradient hover:shadow-neon-blue text-lg px-8 py-4"
              onClick={() => window.location.href = "/api/login"}
            >
              <Zap className="w-5 h-5 mr-2" />
              Get Started with Replit
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-700 hover:border-neon-blue text-lg px-8 py-4"
              onClick={() => setLocation("/manual-login")}
            >
              Manual Login
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Why Choose Si-link?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card-bg border-gray-800 hover:border-neon-blue transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-neon-blue to-blue-600 flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Student Community</h3>
                <p className="text-gray-400">
                  Connect with fellow students and local service providers in your area
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card-bg border-gray-800 hover:border-neon-orange transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-neon-orange to-orange-600 flex items-center justify-center mb-6">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Gig Marketplace</h3>
                <p className="text-gray-400">
                  Post gigs, submit bids, and manage orders all in one platform
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card-bg border-gray-800 hover:border-neon-yellow transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-neon-yellow to-yellow-600 flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Secure & Verified</h3>
                <p className="text-gray-400">
                  KYC verification and secure payment system for safe transactions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-16">
            Everything You Need
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 text-left">
            {[
              "Browse and discover local services",
              "Post gigs and receive competitive bids", 
              "Secure wallet and payment system",
              "Real-time chat and notifications",
              "Rating and review system",
              "KYC verification for trust",
              "Virtual account generation",
              "Mobile-first responsive design"
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-neon-green flex-shrink-0" />
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}