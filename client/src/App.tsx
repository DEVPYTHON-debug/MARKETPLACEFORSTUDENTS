import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Splash from "@/pages/splash";
import Dashboard from "@/pages/dashboard";
import Services from "@/pages/services";
import Gigs from "@/pages/gigs";
import Profile from "@/pages/profile";
import AddMoney from "@/pages/add-money";
import EditProfile from "@/pages/edit-profile";
import CreateService from "@/pages/create-service";
import CreateGig from "@/pages/create-gig";
import Chat from "@/pages/chat";
import Notifications from "@/pages/notifications";
import KYC from "@/pages/kyc";
import ManualLogin from "@/pages/manual-login";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Splash />;
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Splash} />
        <Route path="/manual-login" component={ManualLogin} />
        <Route component={Splash} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/services" component={Services} />
      <Route path="/gigs" component={Gigs} />
      <Route path="/profile" component={Profile} />
      <Route path="/add-money" component={AddMoney} />
      <Route path="/edit-profile" component={EditProfile} />
      <Route path="/create-service" component={CreateService} />
      <Route path="/create-gig" component={CreateGig} />
      <Route path="/chat" component={Chat} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/kyc" component={KYC} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
