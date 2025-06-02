import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Switch } from "@/components/ui/switch";
import { Link, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building,
  Briefcase,
  Users,
  Calendar,
  MapPin,
  Plus,
  Eye,
  Edit,
  LogOut,
  Bell,
  Settings,
} from "lucide-react";

const opportunitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  industry: z.string().min(1, "Industry is required"),
  duration: z.string().min(1, "Duration is required"),
  requirements: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  isRemote: z.boolean().default(false),
  maxApplicants: z.number().min(1).max(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type OpportunityForm = z.infer<typeof opportunitySchema>;

export default function BusinessDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["/api/business/profile"],
    enabled: isAuthenticated && user?.userType === 'business',
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ["/api/business/opportunities"],
    enabled: isAuthenticated && user?.userType === 'business',
  });

  const form = useForm<OpportunityForm>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: "",
      description: "",
      industry: "",
      duration: "",
      requirements: "",
      location: "",
      isRemote: false,
      maxApplicants: 5,
      startDate: "",
      endDate: "",
    },
  });

  const createOpportunityMutation = useMutation({
    mutationFn: async (data: OpportunityForm) => {
      await apiRequest("POST", "/api/opportunities", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Opportunity created successfully!",
      });
      form.reset();
      setShowCreateDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/business/opportunities"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.userType !== 'business')) {
      toast({
        title: "Unauthorized",
        description: "You need to be logged in as a business to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (user && user.userType === 'business' && !profile) {
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

  if (!isAuthenticated || user?.userType !== 'business') {
    return null;
  }

  const onSubmit = (data: OpportunityForm) => {
    createOpportunityMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
                Business Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your job shadowing opportunities and connect with students.
              </p>
            </div>

            <Tabs defaultValue="opportunities" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="opportunities" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Your Opportunities</h2>
                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Opportunity
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Opportunity</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="title">Job Title</Label>
                            <Input
                              id="title"
                              {...form.register("title")}
                              placeholder="e.g., Software Developer"
                            />
                            {form.formState.errors.title && (
                              <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="industry">Industry</Label>
                            <Select onValueChange={(value) => form.setValue("industry", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="technology">Technology</SelectItem>
                                <SelectItem value="healthcare">Healthcare</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="education">Education</SelectItem>
                                <SelectItem value="design">Design</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            {...form.register("description")}
                            placeholder="Describe what students will learn and do during this opportunity"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="duration">Duration</Label>
                            <Select onValueChange={(value) => form.setValue("duration", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1 week">1 week</SelectItem>
                                <SelectItem value="2 weeks">2 weeks</SelectItem>
                                <SelectItem value="3 weeks">3 weeks</SelectItem>
                                <SelectItem value="1 month">1 month</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="maxApplicants">Max Applicants</Label>
                            <Input
                              id="maxApplicants"
                              type="number"
                              {...form.register("maxApplicants", { valueAsNumber: true })}
                              min="1"
                              max="20"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            {...form.register("location")}
                            placeholder="e.g., San Francisco, CA"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isRemote"
                            onCheckedChange={(checked) => form.setValue("isRemote", checked)}
                          />
                          <Label htmlFor="isRemote">Remote/Virtual opportunity</Label>
                        </div>

                        <div>
                          <Label htmlFor="requirements">Requirements (optional)</Label>
                          <Textarea
                            id="requirements"
                            {...form.register("requirements")}
                            placeholder="Any specific requirements or qualifications"
                            rows={2}
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createOpportunityMutation.isPending}>
                            {createOpportunityMutation.isPending ? "Creating..." : "Create Opportunity"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {opportunities.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No opportunities yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first job shadowing opportunity to connect with students.
                      </p>
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Opportunity
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {opportunities.map((opportunity: any) => (
                      <Card key={opportunity.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{opportunity.title}</h3>
                              <p className="text-muted-foreground">{opportunity.industry}</p>
                            </div>
                            <Badge className={getStatusColor(opportunity.status)}>
                              {opportunity.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {opportunity.duration}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {opportunity.location}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {opportunity.currentApplicants}/{opportunity.maxApplicants} applicants
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {opportunity.description}
                          </p>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Applications
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="applications" className="space-y-4">
                <h2 className="text-xl font-semibold">Recent Applications</h2>
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                    <p className="text-muted-foreground">
                      Applications will appear here once students apply to your opportunities.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">{profile.companyName}</h3>
                          <p className="text-muted-foreground">{profile.industry}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Location</label>
                            <p>{profile.location}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Company Size</label>
                            <p>{profile.companySize}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Website</label>
                            <p>{profile.website || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Contact Email</label>
                            <p>{profile.contactEmail}</p>
                          </div>
                        </div>
                        {profile.description && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Description</label>
                            <p className="mt-1">{profile.description}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Complete your profile</h3>
                        <p className="text-muted-foreground mb-4">
                          Add your company information to start posting opportunities.
                        </p>
                        <Link href="/onboarding">
                          <Button>Complete Profile</Button>
                        </Link>
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
                <CardTitle className="text-lg">Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Opportunities</span>
                  <span className="font-semibold">
                    {opportunities.filter((opp: any) => opp.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Applications</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Students Matched</span>
                  <span className="font-semibold text-green-600">0</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Opportunity
                </Button>
                <Link href="/onboarding">
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  View Applications
                </Button>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            {!profile && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-800">Complete Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-yellow-700 mb-4">
                    Complete your company profile to start posting opportunities.
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
