import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import {
  Briefcase,
  Users,
  Building,
  CheckCircle,
  Star,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

const featuredOpportunities = [
  {
    id: 1,
    title: "Sea Urchin Scuba Diving Research Assistant",
    company: "Ocean Depths Marine Research",
    industry: "Marine Biology",
    duration: "2 weeks",
    location: "Monterey Bay, CA",
    description: "Join marine biologists in underwater research collecting sea urchin specimens for ecosystem studies. Learn advanced scuba diving techniques while contributing to ocean conservation efforts.",
  },
  {
    id: 2,
    title: "Disney Imagineer Creative Development",
    company: "Disney Imagineering Labs",
    industry: "Entertainment Design",
    duration: "2 weeks",
    location: "Glendale, CA",
    description: "Step into the magical world of Disney Imagineering where creativity meets cutting-edge technology. Work alongside Imagineers on concept development and ride design.",
  },
  {
    id: 3,
    title: "Honeybee Farming and Apiary Management",
    company: "Golden Hive Apiaries",
    industry: "Sustainable Agriculture",
    duration: "10 days",
    location: "Sonoma County, CA",
    description: "Discover the intricate world of beekeeping with master beekeepers. Learn about hive management, honey extraction, and bee behavior in a commercial apiary setting.",
  },
];

const testimonials = [
  {
    name: "Alex Chen",
    role: "College Student",
    content: "ShadowMe helped me discover my passion for UX design. The 2-week experience at a local agency was eye-opening and led to my current career path!",
    avatar: "AC",
  },
  {
    name: "Sarah Johnson",
    role: "HR Director",
    content: "We've connected with amazing students through ShadowMe. Two of our shadow participants are now full-time employees!",
    avatar: "SJ",
  },
  {
    name: "Marcus Rodriguez",
    role: "High School Senior",
    content: "I shadowed a physical therapist for a week and knew immediately this was my calling. Now I'm applying to pre-PT programs!",
    avatar: "MR",
  },
];

export default function Landing() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [userType, setUserType] = useState<'student' | 'business' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    setUserType(type);
    setUserTypeMutation.mutate(type);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">ShadowMe</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How It Works</a>
              <a href="#opportunities" className="text-muted-foreground hover:text-primary transition-colors">Opportunities</a>
              <a href="#for-businesses" className="text-muted-foreground hover:text-primary transition-colors">For Businesses</a>
              <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About</a>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <Button variant="ghost" onClick={() => window.location.href = "/api/login"}>
                Log In
              </Button>
              <Button onClick={() => setShowSignupDialog(true)}>
                Get Started
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-border">
            <div className="px-4 py-3 space-y-3">
              <a href="#how-it-works" className="block text-muted-foreground hover:text-primary">How It Works</a>
              <a href="#opportunities" className="block text-muted-foreground hover:text-primary">Opportunities</a>
              <a href="#for-businesses" className="block text-muted-foreground hover:text-primary">For Businesses</a>
              <a href="#about" className="block text-muted-foreground hover:text-primary">About</a>
              <div className="pt-3 border-t">
                <Button variant="ghost" className="w-full justify-start" onClick={() => window.location.href = "/api/login"}>
                  Log In
                </Button>
                <Button className="w-full mt-2" onClick={() => setShowSignupDialog(true)}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
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
              >
                Start Exploring Careers
              </Button>
              <Button 
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-50 shadow-lg transform hover:scale-105 transition-all"
                onClick={() => handleGetStarted('business')}
              >
                Post Opportunities
              </Button>
            </div>
            
            <div className="mt-6 text-center">
              <a 
                href="/opportunities" 
                className="inline-flex items-center text-red-100 hover:text-white transition-colors underline underline-offset-4"
              >
                Browse All Unique Opportunities <ArrowRight className="ml-2 h-4 w-4" />
              </a>
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

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Active Opportunities</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-secondary mb-2">2,000+</div>
              <div className="text-muted-foreground">Students Served</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-accent mb-2">150+</div>
              <div className="text-muted-foreground">Partner Businesses</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-success mb-2">95%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-muted/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How ShadowMe Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Three simple steps to discovering your perfect career path</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-all">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Create Your Profile</h3>
                <p className="text-muted-foreground mb-6">Tell us about your interests, skills, and career goals through our personalized questionnaire.</p>
                <Button variant="link" className="text-primary font-medium hover:text-primary/80 p-0">
                  Try the questionnaire <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Discover Opportunities</h3>
                <p className="text-muted-foreground mb-6">Browse curated job shadowing experiences that match your interests and schedule.</p>
                <Button variant="link" className="text-secondary font-medium hover:text-secondary/80 p-0">
                  Explore opportunities <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Start Your Journey</h3>
                <p className="text-muted-foreground mb-6">Apply to experiences, connect with professionals, and gain real industry insights.</p>
                <Button variant="link" className="text-accent font-medium hover:text-accent/80 p-0">
                  View dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      <section id="opportunities" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Opportunities</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Explore diverse career paths across various industries</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="border hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary">{opportunity.industry}</Badge>
                    <span className="text-muted-foreground text-sm">{opportunity.duration}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{opportunity.title}</h3>
                  <p className="text-muted-foreground mb-4">{opportunity.company}</p>
                  <p className="text-muted-foreground text-sm mb-4">{opportunity.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-success font-medium">{opportunity.location}</span>
                    <Button size="sm" onClick={() => handleGetStarted('student')}>
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => handleGetStarted('student')}>
              View All Opportunities
            </Button>
          </div>
        </div>
      </section>

      {/* For Businesses Section */}
      <section id="for-businesses" className="bg-muted/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Partner With Us</h2>
              <p className="text-xl text-muted-foreground mb-8">Help shape the next generation while discovering your future talent</p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Discover Future Talent</h3>
                    <p className="text-muted-foreground">Connect with motivated students and identify potential future employees before they graduate.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Build Your Brand</h3>
                    <p className="text-muted-foreground">Showcase your company culture and values to the next generation of professionals.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Low-Cost Investment</h3>
                    <p className="text-muted-foreground">Minimal time commitment with maximum impact - just 1-2 weeks to make a difference.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button size="lg" onClick={() => handleGetStarted('business')}>
                  Start Posting Opportunities
                </Button>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="rounded-2xl shadow-lg w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Building className="w-24 h-24 text-primary/60" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">Real experiences from students and businesses</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-muted/50">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mr-4 font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-muted-foreground text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-cta py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Discover Your Future?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of students already exploring their dream careers</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-primary hover:bg-gray-50 shadow-lg transform hover:scale-105 transition-all"
              onClick={() => handleGetStarted('student')}
            >
              Start as a Student
            </Button>
            <Button 
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transform hover:scale-105 transition-all"
              onClick={() => handleGetStarted('business')}
            >
              Post as a Business
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">ShadowMe</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">Connecting students with short-term job shadowing experiences to discover their perfect career path.</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">For Students</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Browse Opportunities</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">For Businesses</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Post Opportunities</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partner Benefits</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Sales</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2024 ShadowMe. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Signup Dialog */}
      <Dialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold mb-2">Get Started</DialogTitle>
            <p className="text-center text-muted-foreground">Choose your account type</p>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            <Button 
              className="w-full p-6 h-auto border-2 border-primary hover:bg-primary/5" 
              variant="outline"
              onClick={() => handleGetStarted('student')}
              disabled={setUserTypeMutation.isPending}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">I'm a Student</div>
                  <div className="text-sm text-muted-foreground">Explore career opportunities</div>
                </div>
              </div>
            </Button>

            <Button 
              className="w-full p-6 h-auto border-2 border-secondary hover:bg-secondary/5" 
              variant="outline"
              onClick={() => handleGetStarted('business')}
              disabled={setUserTypeMutation.isPending}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">I'm a Business</div>
                  <div className="text-sm text-muted-foreground">Post opportunities</div>
                </div>
              </div>
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => window.location.href = "/api/login"}>
                Sign in
              </Button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
