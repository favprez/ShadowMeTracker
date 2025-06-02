import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building,
  MapPin,
  Globe,
  Mail,
  Phone,
  Users,
  CheckCircle,
} from "lucide-react";

const businessProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  companySize: z.string().min(1, "Company size is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  contactEmail: z.string().email("Please enter a valid email"),
  contactPhone: z.string().optional(),
});

type BusinessProfileForm = z.infer<typeof businessProfileSchema>;

export default function BusinessOnboarding() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: existingProfile } = useQuery({
    queryKey: ["/api/business/profile"],
    enabled: isAuthenticated && user?.userType === 'business',
  });

  const form = useForm<BusinessProfileForm>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      companySize: "",
      location: "",
      description: "",
      website: "",
      contactEmail: user?.email || "",
      contactPhone: "",
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (data: BusinessProfileForm) => {
      await apiRequest("POST", "/api/business/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your business profile has been saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/business/profile"] });
      setLocation("/");
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
        description: "You need to be logged in as a business to complete onboarding.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    // Pre-fill form with existing profile data
    if (existingProfile) {
      form.reset({
        companyName: existingProfile.companyName || "",
        industry: existingProfile.industry || "",
        companySize: existingProfile.companySize || "",
        location: existingProfile.location || "",
        description: existingProfile.description || "",
        website: existingProfile.website || "",
        contactEmail: existingProfile.contactEmail || user?.email || "",
        contactPhone: existingProfile.contactPhone || "",
      });
    } else if (user?.email) {
      form.setValue("contactEmail", user.email);
    }
  }, [isAuthenticated, isLoading, user, existingProfile, toast, form]);

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

  const onSubmit = (data: BusinessProfileForm) => {
    saveProfileMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to ShadowMe Business
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tell us about your company so we can help you connect with talented students looking to explore your industry.
          </p>
        </div>

        {/* Form Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Company Name */}
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., TechFlow Solutions"
                  {...form.register("companyName")}
                />
                {form.formState.errors.companyName && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.companyName.message}
                  </p>
                )}
              </div>

              {/* Industry and Company Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select onValueChange={(value) => form.setValue("industry", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="marketing">Marketing & Advertising</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="design">Design & Creative</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="nonprofit">Non-profit</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.industry && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.industry.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="companySize">Company Size *</Label>
                  <Select onValueChange={(value) => form.setValue("companySize", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501-1000">501-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.companySize && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.companySize.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location *
                </Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA"
                  {...form.register("location")}
                />
                {form.formState.errors.location && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.location.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Company Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Tell students about your company, culture, and what makes you unique..."
                  rows={4}
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              {/* Website */}
              <div>
                <Label htmlFor="website">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Website (optional)
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.yourcompany.com"
                  {...form.register("website")}
                />
                {form.formState.errors.website && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.website.message}
                  </p>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactEmail">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Contact Email *
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="contact@yourcompany.com"
                      {...form.register("contactEmail")}
                    />
                    {form.formState.errors.contactEmail && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.contactEmail.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contactPhone">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Contact Phone (optional)
                    </Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      {...form.register("contactPhone")}
                    />
                  </div>
                </div>
              </div>

              {/* Benefits Section */}
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">Why partner with ShadowMe?</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Discover Future Talent</p>
                      <p className="text-sm text-muted-foreground">Connect with motivated students before they graduate</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Build Your Brand</p>
                      <p className="text-sm text-muted-foreground">Showcase your company culture to the next generation</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Low Time Commitment</p>
                      <p className="text-sm text-muted-foreground">Just 1-2 weeks to make a lasting impact</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saveProfileMutation.isPending}
                  className="bg-success hover:bg-success/90"
                >
                  {saveProfileMutation.isPending ? "Saving..." : "Complete Setup"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
