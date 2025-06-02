import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "wouter";
import {
  Calendar,
  MapPin,
  Clock,
  Star,
  Building,
  Briefcase,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Bell,
} from "lucide-react";

export default function StudentDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ["/api/student/profile"],
    enabled: isAuthenticated && user?.userType === 'student',
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["/api/student/applications"],
    enabled: isAuthenticated && user?.userType === 'student',
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ["/api/opportunities"],
  });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.userType !== 'student')) {
      toast({
        title: "Unauthorized",
        description: "You need to be logged in as a student to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (user && user.userType === 'student' && (!profile || !profile.completedOnboarding)) {
      setLocation("/onboarding");
    }
  }, [isAuthenticated, isLoading, user, profile, toast, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.userType !== 'student') {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const recommendedOpportunities = opportunities.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">ShadowMe</span>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Avatar>
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" onClick={() => window.location.href = "/api/logout"}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-muted-foreground">
                Continue exploring career opportunities and track your applications.
              </p>
            </div>

            <Tabs defaultValue="applications" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="applications">My Applications</TabsTrigger>
                <TabsTrigger value="opportunities">Recommended</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="applications" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Your Applications</h2>
                  <Link href="/opportunities">
                    <Button>Browse More Opportunities</Button>
                  </Link>
                </div>

                {applications.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start exploring opportunities to begin your career journey.
                      </p>
                      <Link href="/opportunities">
                        <Button>Explore Opportunities</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application: any) => (
                      <Card key={application.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">Software Developer</h3>
                              <p className="text-muted-foreground">TechFlow Solutions</p>
                            </div>
                            <Badge className={getStatusColor(application.status)}>
                              {application.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Applied {new Date(application.appliedAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              2 weeks
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              San Francisco, CA
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">
                              Experience full-stack development and modern programming practices.
                            </p>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Messages
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Recommended for You</h2>
                  <Link href="/opportunities">
                    <Button variant="outline">View All</Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {recommendedOpportunities.map((opportunity: any) => (
                    <Card key={opportunity.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{opportunity.title}</h3>
                            <p className="text-muted-foreground">Tech Company</p>
                          </div>
                          <Badge variant="secondary">{opportunity.industry}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {opportunity.duration}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {opportunity.location}
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            95% Match
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {opportunity.description}
                        </p>
                        <Button size="sm">Apply Now</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={user?.profileImageUrl} />
                        <AvatarFallback className="text-lg">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {user?.firstName} {user?.lastName}
                        </h3>
                        <p className="text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    
                    {profile && (
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Education Level</label>
                          <p className="capitalize">{profile.educationLevel}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Work Style</label>
                          <p className="capitalize">{profile.workStyle}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Availability</label>
                          <p className="capitalize">{profile.availability}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Travel Distance</label>
                          <p className="capitalize">{profile.travelDistance}</p>
                        </div>
                        {profile.interests && (
                          <div className="col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Interests</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {(profile.interests as string[]).map((interest) => (
                                <Badge key={interest} variant="outline">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="pt-4 border-t">
                      <Link href="/onboarding">
                        <Button variant="outline">
                          <Settings className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Applications</span>
                  <span className="font-semibold">{applications.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Accepted</span>
                  <span className="font-semibold text-green-600">
                    {applications.filter((app: any) => app.status === 'accepted').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-semibold text-blue-600">
                    {applications.filter((app: any) => app.status === 'completed').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/opportunities">
                  <Button className="w-full justify-start" variant="outline">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Opportunities
                  </Button>
                </Link>
                <Link href="/onboarding">
                  <Button className="w-full justify-start" variant="outline">
                    <User className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Messages
                </Button>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            {profile && !profile.completedOnboarding && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-800">Complete Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-yellow-700 mb-4">
                    Complete your profile to get better opportunity recommendations.
                  </p>
                  <Link href="/onboarding">
                    <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                      Complete Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
