import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import StudentDashboard from "@/pages/student-dashboard";
import BusinessDashboard from "@/pages/business-dashboard";
import Opportunities from "@/pages/opportunities";
import StudentOnboarding from "@/pages/student-onboarding";
import BusinessOnboarding from "@/pages/business-onboarding";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/opportunities" component={Opportunities} />
        </>
      ) : (
        <>
          {user?.userType === 'student' ? (
            <>
              <Route path="/" component={StudentDashboard} />
              <Route path="/onboarding" component={StudentOnboarding} />
              <Route path="/opportunities" component={Opportunities} />
            </>
          ) : user?.userType === 'business' ? (
            <>
              <Route path="/" component={BusinessDashboard} />
              <Route path="/onboarding" component={BusinessOnboarding} />
            </>
          ) : (
            <Route path="/" component={Landing} />
          )}
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
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
