import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Building,
  Briefcase,
  Calendar,
  Star,
  Users,
  ChevronDown,
} from "lucide-react";

const applicationSchema = z.object({
  opportunityId: z.number(),
  coverLetter: z.string().min(10, "Cover letter must be at least 10 characters"),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

export default function Opportunities() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [remoteFilter, setRemoteFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["/api/opportunities"],
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      coverLetter: "",
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (data: ApplicationForm) => {
      await apiRequest("POST", "/api/applications", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your application has been submitted!",
      });
      form.reset();
      setSelectedOpportunity(null);
      queryClient.invalidateQueries({ queryKey: ["/api/student/applications"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApply = (opportunity: any) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to apply for opportunities",
        variant: "default",
      });
      window.location.href = "/api/login";
      return;
    }
    if (!user?.userType || user.userType !== 'student') {
      toast({
        title: "Login Required",
        description: "Please log in to apply for opportunities.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }

    if (user?.userType !== 'student') {
      toast({
        title: "Student Account Required",
        description: "Only students can apply for opportunities.",
        variant: "destructive",
      });
      return;
    }

    setSelectedOpportunity(opportunity);
    form.setValue("opportunityId", opportunity.id);
  };

  const onSubmit = (data: ApplicationForm) => {
    applyMutation.mutate(data);
  };

  const filteredOpportunities = opportunities.filter((opp: any) => {
    const matchesSearch = 
      opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const industries = Array.from(new Set(opportunities.map((opp: any) => opp.industry))).filter(Boolean);
  const locations = Array.from(new Set(opportunities.map((opp: any) => opp.location))).filter(Boolean);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-foreground">ShadowMe</span>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link href="/">
                  <Button variant="outline">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => window.location.href = "/api/login"}>
                    Log In
                  </Button>
                  <Button onClick={() => window.location.href = "/api/login"}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">Explore Opportunities</h1>
          
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:w-auto"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {showFilters && (
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Select value={industryFilter} onValueChange={setIndustryFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All industries" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All industries</SelectItem>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Select value={locationFilter} onValueChange={setLocationFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All locations</SelectItem>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="remote">Work Type</Label>
                      <Select value={remoteFilter} onValueChange={setRemoteFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All types</SelectItem>
                          <SelectItem value="false">In-person</SelectItem>
                          <SelectItem value="true">Remote</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIndustryFilter("");
                        setLocationFilter("");
                        setRemoteFilter("");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            {filteredOpportunities.length} opportunities found
          </p>
        </div>

        {/* Opportunities Grid */}
        {filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No opportunities found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setIndustryFilter("");
                setLocationFilter("");
                setRemoteFilter("");
              }}>
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredOpportunities.map((opportunity: any) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-foreground">
                          {opportunity.title}
                        </h3>
                        <Badge variant="secondary">{opportunity.industry}</Badge>
                        {opportunity.isRemote && (
                          <Badge variant="outline">Remote</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground font-medium mb-3">
                        {opportunity.businessProfile?.companyName || "Company Name"}
                      </p>
                    </div>
                    <Button onClick={() => handleApply(opportunity)}>
                      Apply Now
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
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
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Posted {new Date(opportunity.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-foreground mb-4">
                    {opportunity.description}
                  </p>

                  {opportunity.requirements && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Requirements:</h4>
                      <p className="text-sm text-muted-foreground">{opportunity.requirements}</p>
                    </div>
                  )}

                  {opportunity.skills && opportunity.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(opportunity.skills as string[]).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Application Dialog */}
      <Dialog open={!!selectedOpportunity} onOpenChange={() => setSelectedOpportunity(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply to {selectedOpportunity?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedOpportunity && (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">{selectedOpportunity.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedOpportunity.businessProfile?.companyName || "Company Name"}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{selectedOpportunity.duration}</span>
                  <span>{selectedOpportunity.location}</span>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="coverLetter">Cover Letter</Label>
                  <Textarea
                    id="coverLetter"
                    {...form.register("coverLetter")}
                    placeholder="Tell us why you're interested in this opportunity and what you hope to learn..."
                    rows={6}
                  />
                  {form.formState.errors.coverLetter && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.coverLetter.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setSelectedOpportunity(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={applyMutation.isPending}>
                    {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
