import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  User,
  GraduationCap,
  Heart,
  Users,
  Calendar,
  MapPin,
  Target,
} from "lucide-react";

const profileSchema = z.object({
  educationLevel: z.string().min(1, "Education level is required"),
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
  workStyle: z.string().min(1, "Work style is required"),
  availability: z.string().min(1, "Availability is required"),
  travelDistance: z.string().min(1, "Travel distance is required"),
  location: z.string().min(1, "Location is required"),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface QuestionData {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const questions: QuestionData[] = [
  {
    step: 1,
    title: "What's your current education level?",
    description: "Help us understand where you are in your educational journey",
    icon: <GraduationCap className="w-6 h-6" />,
  },
  {
    step: 2,
    title: "What interests you most?",
    description: "Select all areas that spark your curiosity",
    icon: <Heart className="w-6 h-6" />,
  },
  {
    step: 3,
    title: "How do you prefer to work?",
    description: "Understanding your work style helps us match you better",
    icon: <Users className="w-6 h-6" />,
  },
  {
    step: 4,
    title: "What's your availability?",
    description: "When are you available for shadowing opportunities?",
    icon: <Calendar className="w-6 h-6" />,
  },
  {
    step: 5,
    title: "How far are you willing to travel?",
    description: "This helps us show relevant local opportunities",
    icon: <MapPin className="w-6 h-6" />,
  },
  {
    step: 6,
    title: "Tell us about yourself",
    description: "Add any additional information about your goals and skills",
    icon: <Target className="w-6 h-6" />,
  },
];

const interestOptions = [
  "Technology",
  "Healthcare",
  "Finance",
  "Marketing",
  "Education",
  "Design",
  "Engineering",
  "Science",
  "Arts",
  "Business",
  "Law",
  "Media",
];

const skillOptions = [
  "Communication",
  "Leadership",
  "Problem Solving",
  "Teamwork",
  "Creativity",
  "Analytical Thinking",
  "Technical Skills",
  "Organization",
  "Time Management",
  "Research",
];

export default function StudentOnboarding() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = questions.length;

  const { data: existingProfile } = useQuery({
    queryKey: ["/api/student/profile"],
    enabled: isAuthenticated && user?.userType === 'student',
  });

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      educationLevel: "",
      interests: [],
      workStyle: "",
      availability: "",
      travelDistance: "",
      location: "",
      bio: "",
      skills: [],
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      await apiRequest("POST", "/api/student/profile", {
        ...data,
        completedOnboarding: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your profile has been completed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/student/profile"] });
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
    if (!isLoading && (!isAuthenticated || user?.userType !== 'student')) {
      toast({
        title: "Unauthorized",
        description: "You need to be logged in as a student to complete onboarding.",
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
        educationLevel: existingProfile.educationLevel || "",
        interests: (existingProfile.interests as string[]) || [],
        workStyle: existingProfile.workStyle || "",
        availability: existingProfile.availability || "",
        travelDistance: existingProfile.travelDistance || "",
        location: existingProfile.location || "",
        bio: existingProfile.bio || "",
        skills: (existingProfile.skills as string[]) || [],
      });
    }
  }, [isAuthenticated, isLoading, user, existingProfile, toast, form]);

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

  const progress = (currentStep / totalSteps) * 100;
  const currentQuestion = questions[currentStep - 1];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    const formData = form.getValues();
    try {
      await profileSchema.parseAsync(formData);
      saveProfileMutation.mutate(formData);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
    }
  };

  const handleInterestToggle = (interest: string) => {
    const currentInterests = form.getValues("interests");
    const updatedInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    form.setValue("interests", updatedInterests);
  };

  const handleSkillToggle = (skill: string) => {
    const currentSkills = form.getValues("skills") || [];
    const updatedSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    form.setValue("skills", updatedSkills);
  };

  const selectedInterests = form.watch("interests");
  const selectedSkills = form.watch("skills") || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Let's Get You Set Up!
          </h1>
          <p className="text-muted-foreground mb-6">
            Tell us about yourself so we can find the perfect opportunities for you
          </p>
          <div className="max-w-md mx-auto">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </div>

        {/* Question Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {currentQuestion.icon}
            </div>
            <CardTitle className="text-xl">{currentQuestion.title}</CardTitle>
            <p className="text-muted-foreground">{currentQuestion.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Education Level */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: "high-school", label: "High School", desc: "Currently enrolled or graduated" },
                    { value: "college", label: "College/University", desc: "Undergraduate or graduate student" },
                    { value: "career-change", label: "Career Change", desc: "Looking to switch careers" },
                    { value: "other", label: "Other", desc: "Different situation" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => form.setValue("educationLevel", option.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        form.watch("educationLevel") === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Interests */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {interestOptions.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        selectedInterests.includes(interest)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                {selectedInterests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedInterests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Work Style */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {[
                  { value: "team", label: "In a team", desc: "Collaborating with others, group projects" },
                  { value: "independent", label: "Independently", desc: "Working alone, self-directed tasks" },
                  { value: "mixed", label: "Mix of both", desc: "Flexibility between team and solo work" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => form.setValue("workStyle", option.value)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      form.watch("workStyle") === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.desc}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 4: Availability */}
            {currentStep === 4 && (
              <div className="space-y-4">
                {[
                  { value: "weekdays", label: "Weekdays only", desc: "Monday through Friday" },
                  { value: "weekends", label: "Weekends preferred", desc: "Saturday and Sunday" },
                  { value: "flexible", label: "Flexible schedule", desc: "Any day of the week" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => form.setValue("availability", option.value)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      form.watch("availability") === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.desc}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 5: Travel Distance */}
            {currentStep === 5 && (
              <div className="space-y-4">
                {[
                  { value: "local", label: "Within 10 miles", desc: "Close to home" },
                  { value: "regional", label: "Within 25 miles", desc: "Regional commute" },
                  { value: "remote", label: "Remote/Virtual", desc: "Online opportunities" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => form.setValue("travelDistance", option.value)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      form.watch("travelDistance") === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.desc}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 6: Additional Info */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="location">Your Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., San Francisco, CA"
                    {...form.register("location")}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Tell us about yourself (optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Share your goals, interests, or anything else you'd like us to know..."
                    rows={4}
                    {...form.register("bio")}
                  />
                </div>

                <div>
                  <Label>Your Skills (optional)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {skillOptions.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleSkillToggle(skill)}
                        className={`p-2 rounded-lg border text-sm transition-colors ${
                          selectedSkills.includes(skill)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  {selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedSkills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext} className="flex items-center">
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              disabled={saveProfileMutation.isPending}
              className="flex items-center bg-success hover:bg-success/90"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {saveProfileMutation.isPending ? "Saving..." : "Complete Setup"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
