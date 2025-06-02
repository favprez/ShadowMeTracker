import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  MapPin,
  Users,
  Calendar,
  Building,
} from "lucide-react";

interface OpportunityCardProps {
  opportunity: {
    id: number;
    title: string;
    industry: string;
    duration: string;
    location: string;
    description: string;
    isRemote?: boolean;
    currentApplicants: number;
    maxApplicants: number;
    createdAt: string;
    businessProfile?: {
      companyName: string;
    };
    skills?: string[];
    requirements?: string;
  };
  onApply: (opportunity: any) => void;
  showFullDescription?: boolean;
}

export default function OpportunityCard({ 
  opportunity, 
  onApply, 
  showFullDescription = false 
}: OpportunityCardProps) {
  const description = showFullDescription 
    ? opportunity.description 
    : opportunity.description.length > 150 
      ? `${opportunity.description.substring(0, 150)}...` 
      : opportunity.description;

  return (
    <Card className="hover:shadow-lg transition-shadow">
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
            <div className="flex items-center text-muted-foreground mb-3">
              <Building className="w-4 h-4 mr-2" />
              <p className="font-medium">
                {opportunity.businessProfile?.companyName || "Company Name"}
              </p>
            </div>
          </div>
          <Button onClick={() => onApply(opportunity)}>
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
          {description}
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
  );
}
