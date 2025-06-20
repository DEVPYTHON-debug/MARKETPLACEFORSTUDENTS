import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Services from "@/pages/services";
import Gigs from "@/pages/gigs";
import Profile from "@/pages/profile";
import AddMoney from "@/pages/add-money";
import EditProfile from "@/pages/edit-profile";
import CreateService from "@/pages/create-service";
import CreateGig from "@/pages/create-gig";
import Chat from "@/pages/chat";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/services" component={Services} />
          <Route path="/gigs" component={Gigs} />
          <Route path="/profile" component={Profile} />
          <Route path="/add-money" component={AddMoney} />
          <Route path="/edit-profile" component={EditProfile} />
          <Route path="/create-service" component={CreateService} />
          <Route path="/create-gig" component={CreateGig} />
          <Route path="/chat" component={Chat} />
        </>
      )}
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
