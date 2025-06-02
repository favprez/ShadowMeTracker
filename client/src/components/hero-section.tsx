import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle } from "lucide-react";

export default function HeroSection() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const setUserTypeMutation = useMutation({
    mutationFn: async (type: 'student' | 'business') => {
      await apiRequest("POST", "/api/auth/set-user-type", { userType: type });
    },
    onSuccess: () => {
      window.location.href = "/api/login";
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGetStarted = (type: 'student' | 'business') => {
    if (isAuthenticated) {
      // If already authenticated, go directly to appropriate page
      window.location.href = "/";
    } else {
      setUserTypeMutation.mutate(type);
    }
  };

  return (
    <section className="relative gradient-hero py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Discover Your<br />
            <span className="text-accent">Dream Career</span>
          </h1>
          <p className="text-xl md:text-2xl text-red-100 mb-8 max-w-3xl mx-auto">
            Skip the guesswork. Experience real careers through short-term job shadowing opportunities with local businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transform hover:scale-105 transition-all"
              onClick={() => handleGetStarted('student')}
              disabled={setUserTypeMutation.isPending}
            >
              {setUserTypeMutation.isPending ? "Setting up..." : "Start Exploring Careers"}
            </Button>
            <Button 
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-gray-50 shadow-lg transform hover:scale-105 transition-all"
              onClick={() => handleGetStarted('business')}
              disabled={setUserTypeMutation.isPending}
            >
              {setUserTypeMutation.isPending ? "Setting up..." : "Post Opportunities"}
            </Button>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-red-100">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>1-2 Week Experiences</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Free for Students</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Real Industry Experience</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
