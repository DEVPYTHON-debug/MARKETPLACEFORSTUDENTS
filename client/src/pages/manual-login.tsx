import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Lock, 
  UserPlus,
  LogIn,
  ArrowLeft,
  Zap
} from "lucide-react";

export default function ManualLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("student");

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      return apiRequest("POST", "/api/auth/manual-login", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      // Invalidate auth query to refresh user state
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Reload the page to ensure proper authentication state
      window.location.href = "/dashboard";
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: string;
    }) => {
      return apiRequest("POST", "/api/auth/manual-register", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Account created successfully! Please log in.",
      });
      // Switch to login tab
      const loginTab = document.querySelector('[value="login"]') as HTMLElement;
      loginTab?.click();
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleLogin = () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    loginMutation.mutate({
      email: loginEmail.trim(),
      password: loginPassword.trim(),
    });
  };

  const handleRegister = () => {
    if (!registerEmail.trim() || !registerPassword.trim() || !firstName.trim() || !lastName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (registerPassword.length < 6) {
      toast({
        title: "Password Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    registerMutation.mutate({
      email: registerEmail.trim(),
      password: registerPassword.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/")}
            className="absolute top-6 left-6 p-2 hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center justify-center space-x-2">
            <Zap className="w-8 h-8 text-neon-blue" />
            <h1 className="text-3xl font-bold neon-gradient-text">Si-link</h1>
          </div>
          <p className="text-gray-400">Connect with your student community</p>
        </div>

        {/* Auth Card */}
        <Card className="bg-card-bg border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-center">
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger value="login" className="data-[state=active]:bg-neon-blue data-[state=active]:text-white">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-neon-orange data-[state=active]:text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-gray-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-12 bg-gray-900 border-gray-700 focus:border-neon-blue"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-12 bg-gray-900 border-gray-700 focus:border-neon-blue"
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleLogin}
                  disabled={loginMutation.isPending}
                  className="w-full neon-gradient hover:shadow-neon-blue"
                >
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
                </Button>

                <div className="text-center">
                  <Button 
                    variant="link" 
                    className="text-neon-blue hover:text-neon-blue/80"
                    onClick={() => window.location.href = "/api/login"}
                  >
                    Or continue with Replit
                  </Button>
                </div>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name" className="text-gray-300">
                      First Name
                    </Label>
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="bg-gray-900 border-gray-700 focus:border-neon-orange"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name" className="text-gray-300">
                      Last Name
                    </Label>
                    <Input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="bg-gray-900 border-gray-700 focus:border-neon-orange"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-gray-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="register-email"
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="pl-12 bg-gray-900 border-gray-700 focus:border-neon-orange"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="register-password"
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="pl-12 bg-gray-900 border-gray-700 focus:border-neon-orange"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-300">
                    I am a
                  </Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 focus:border-neon-orange">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="provider">Service Provider</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleRegister}
                  disabled={registerMutation.isPending}
                  className="w-full bg-gradient-to-r from-neon-orange to-orange-600 hover:from-neon-orange/90 hover:to-orange-600/90"
                >
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center">
                  <Button 
                    variant="link" 
                    className="text-neon-orange hover:text-neon-orange/80"
                    onClick={() => window.location.href = "/api/login"}
                  >
                    Or continue with Replit
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}