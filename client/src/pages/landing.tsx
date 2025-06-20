import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Star, Briefcase, CreditCard, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-glass-bg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 neon-gradient rounded-lg flex items-center justify-center shadow-neon-orange">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold neon-gradient-text">Si-link</h1>
            </div>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="neon-gradient hover:shadow-neon-orange transition-all"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="floating-animation">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="neon-gradient-text">
                Connecting Students with Local Services
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Seamlessly and Intelligently. Discover services, post gigs, and build your reputation in the student marketplace.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
            <Card className="bg-card-bg border-gray-800">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-neon-orange mb-2">250+</div>
                <div className="text-sm text-gray-400">Active Services</div>
              </CardContent>
            </Card>
            <Card className="bg-card-bg border-gray-800">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-neon-blue mb-2">1.2K</div>
                <div className="text-sm text-gray-400">Students</div>
              </CardContent>
            </Card>
            <Card className="bg-card-bg border-gray-800">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-neon-yellow mb-2">180+</div>
                <div className="text-sm text-gray-400">Providers</div>
              </CardContent>
            </Card>
          </div>

          <Button 
            size="lg"
            onClick={() => window.location.href = "/api/login"}
            className="neon-gradient hover:shadow-neon-orange transition-all text-lg px-8 py-6"
          >
            Join Si-link Today
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card-bg bg-opacity-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 neon-gradient-text">
            Why Choose Si-link?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card-bg border-gray-800 glow-effect hover:border-neon-orange">
              <CardContent className="p-6">
                <Users className="w-12 h-12 text-neon-orange mb-4" />
                <h4 className="text-xl font-semibold mb-3">Student-Focused</h4>
                <p className="text-gray-400">
                  Built specifically for the student community with services tailored to your needs.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card-bg border-gray-800 glow-effect hover:border-neon-blue">
              <CardContent className="p-6">
                <Star className="w-12 h-12 text-neon-blue mb-4" />
                <h4 className="text-xl font-semibold mb-3">Quality Assured</h4>
                <p className="text-gray-400">
                  Verified providers with ratings and reviews to ensure quality service delivery.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card-bg border-gray-800 glow-effect hover:border-neon-yellow">
              <CardContent className="p-6">
                <Briefcase className="w-12 h-12 text-neon-yellow mb-4" />
                <h4 className="text-xl font-semibold mb-3">Gig Marketplace</h4>
                <p className="text-gray-400">
                  Post your own gigs and earn money by offering your skills to fellow students.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card-bg border-gray-800 glow-effect hover:border-neon-orange">
              <CardContent className="p-6">
                <CreditCard className="w-12 h-12 text-neon-orange mb-4" />
                <h4 className="text-xl font-semibold mb-3">Secure Payments</h4>
                <p className="text-gray-400">
                  Built-in wallet system with secure transactions and QR code payments.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card-bg border-gray-800 glow-effect hover:border-neon-blue">
              <CardContent className="p-6">
                <Shield className="w-12 h-12 text-neon-blue mb-4" />
                <h4 className="text-xl font-semibold mb-3">Verified Users</h4>
                <p className="text-gray-400">
                  KYC verification and badge system to build trust in the community.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card-bg border-gray-800 glow-effect hover:border-neon-yellow">
              <CardContent className="p-6">
                <TrendingUp className="w-12 h-12 text-neon-yellow mb-4" />
                <h4 className="text-xl font-semibold mb-3">AI Assistant</h4>
                <p className="text-gray-400">
                  Smart recommendations and automated support to enhance your experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold mb-6 neon-gradient-text">
            Ready to Get Started?
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students already using Si-link to discover services and grow their businesses.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = "/api/login"}
            className="neon-gradient hover:shadow-neon-blue transition-all text-lg px-8 py-6"
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-card-bg py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 neon-gradient rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold neon-gradient-text">Si-link</span>
          </div>
          <p className="text-gray-400">
            Connecting Students with Local Services – Seamlessly and Intelligently
          </p>
        </div>
      </footer>
    </div>
  );
}
