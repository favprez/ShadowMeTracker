import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  GraduationCap,
  Heart,
  Users,
  Calendar,
  MapPin,
} from "lucide-react";

interface QuestionnaireData {
  educationLevel: string;
  interests: string[];
  workStyle: string;
  availability: string;
  travelDistance: string;
}

interface OnboardingQuestionnaireProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: QuestionnaireData) => void;
  onGetStarted: (userType: 'student' | 'business') => void;
}

const questions = [
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

export default function OnboardingQuestionnaire({
  isOpen,
  onClose,
  onComplete,
  onGetStarted,
}: OnboardingQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Partial<QuestionnaireData>>({
    interests: [],
  });

  const totalSteps = questions.length;
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

  const handleComplete = () => {
    if (isFormValid()) {
      onComplete(answers as QuestionnaireData);
      onGetStarted('student');
    }
  };

  const isFormValid = () => {
    return (
      answers.educationLevel &&
      answers.interests &&
      answers.interests.length > 0 &&
      answers.workStyle &&
      answers.availability &&
      answers.travelDistance
    );
  };

  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return !!answers.educationLevel;
      case 2:
        return answers.interests && answers.interests.length > 0;
      case 3:
        return !!answers.workStyle;
      case 4:
        return !!answers.availability;
      case 5:
        return !!answers.travelDistance;
      default:
        return false;
    }
  };

  const handleInterestToggle = (interest: string) => {
    const currentInterests = answers.interests || [];
    const updatedInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    setAnswers({ ...answers, interests: updatedInterests });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold mb-2">
            Let's Find Your Perfect Match
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Tell us about yourself so we can recommend the best opportunities
          </p>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </DialogHeader>

        {/* Question Content */}
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {currentQuestion.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{currentQuestion.title}</h3>
            <p className="text-muted-foreground">{currentQuestion.description}</p>
          </div>

          {/* Step 1: Education Level */}
          {currentStep === 1 && (
            <div className="space-y-3">
              {[
                { value: "high-school", label: "High School", desc: "Currently enrolled or graduated" },
                { value: "college", label: "College/University", desc: "Undergraduate or graduate student" },
                { value: "career-change", label: "Career Change", desc: "Looking to switch careers" },
                { value: "other", label: "Other", desc: "Different situation" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAnswers({ ...answers, educationLevel: option.value })}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    answers.educationLevel === option.value
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
                      (answers.interests || []).includes(interest)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              {answers.interests && answers.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {answers.interests.map((interest) => (
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
            <div className="space-y-3">
              {[
                { value: "team", label: "In a team", desc: "Collaborating with others, group projects" },
                { value: "independent", label: "Independently", desc: "Working alone, self-directed tasks" },
                { value: "mixed", label: "Mix of both", desc: "Flexibility between team and solo work" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAnswers({ ...answers, workStyle: option.value })}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    answers.workStyle === option.value
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
            <div className="space-y-3">
              {[
                { value: "weekdays", label: "Weekdays only", desc: "Monday through Friday" },
                { value: "weekends", label: "Weekends preferred", desc: "Saturday and Sunday" },
                { value: "flexible", label: "Flexible schedule", desc: "Any day of the week" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAnswers({ ...answers, availability: option.value })}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    answers.availability === option.value
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
            <div className="space-y-3">
              {[
                { value: "local", label: "Within 10 miles", desc: "Close to home" },
                { value: "regional", label: "Within 25 miles", desc: "Regional commute" },
                { value: "remote", label: "Remote/Virtual", desc: "Online opportunities" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAnswers({ ...answers, travelDistance: option.value })}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    answers.travelDistance === option.value
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
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
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
            <Button 
              onClick={handleNext} 
              disabled={!canContinue()}
              className="flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              disabled={!isFormValid()}
              className="flex items-center bg-success hover:bg-success/90"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
