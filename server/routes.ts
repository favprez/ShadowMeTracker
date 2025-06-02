import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertStudentProfileSchema,
  insertBusinessProfileSchema,
  insertOpportunitySchema,
  insertApplicationSchema,
  insertMessageSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get profile based on user type
      let profile = null;
      if (user.userType === 'student') {
        profile = await storage.getStudentProfile(userId);
      } else if (user.userType === 'business') {
        profile = await storage.getBusinessProfile(userId);
      }

      res.json({ ...user, profile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Set user type route
  app.post('/api/auth/set-user-type', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { userType } = req.body;

      if (!['student', 'business'].includes(userType)) {
        return res.status(400).json({ message: "Invalid user type" });
      }

      const user = await storage.upsertUser({
        id: userId,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url,
        userType,
      });

      res.json(user);
    } catch (error) {
      console.error("Error setting user type:", error);
      res.status(500).json({ message: "Failed to set user type" });
    }
  });

  // Student profile routes
  app.get('/api/student/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getStudentProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error fetching student profile:", error);
      res.status(500).json({ message: "Failed to fetch student profile" });
    }
  });

  app.post('/api/student/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertStudentProfileSchema.parse({
        ...req.body,
        userId,
      });

      const existingProfile = await storage.getStudentProfile(userId);
      
      let profile;
      if (existingProfile) {
        profile = await storage.updateStudentProfile(userId, profileData);
      } else {
        profile = await storage.createStudentProfile(profileData);
      }

      res.json(profile);
    } catch (error) {
      console.error("Error creating/updating student profile:", error);
      res.status(500).json({ message: "Failed to save student profile" });
    }
  });

  // Business profile routes
  app.get('/api/business/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getBusinessProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Business profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error fetching business profile:", error);
      res.status(500).json({ message: "Failed to fetch business profile" });
    }
  });

  app.post('/api/business/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertBusinessProfileSchema.parse({
        ...req.body,
        userId,
      });

      const existingProfile = await storage.getBusinessProfile(userId);
      
      let profile;
      if (existingProfile) {
        profile = await storage.updateBusinessProfile(userId, profileData);
      } else {
        profile = await storage.createBusinessProfile(profileData);
      }

      res.json(profile);
    } catch (error) {
      console.error("Error creating/updating business profile:", error);
      res.status(500).json({ message: "Failed to save business profile" });
    }
  });

  // Opportunity routes
  app.get('/api/opportunities', async (req, res) => {
    try {
      const { industry, location, isRemote } = req.query;
      
      const filters: any = {};
      if (industry) filters.industry = industry as string;
      if (location) filters.location = location as string;
      if (isRemote !== undefined) filters.isRemote = isRemote === 'true';

      const opportunities = await storage.getOpportunities(filters);
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  app.get('/api/opportunities/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const opportunity = await storage.getOpportunity(id);
      
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }

      res.json(opportunity);
    } catch (error) {
      console.error("Error fetching opportunity:", error);
      res.status(500).json({ message: "Failed to fetch opportunity" });
    }
  });

  app.post('/api/opportunities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const businessProfile = await storage.getBusinessProfile(userId);
      
      if (!businessProfile) {
        return res.status(400).json({ message: "Business profile required" });
      }

      const opportunityData = insertOpportunitySchema.parse({
        ...req.body,
        businessProfileId: businessProfile.id,
      });

      const opportunity = await storage.createOpportunity(opportunityData);
      res.json(opportunity);
    } catch (error) {
      console.error("Error creating opportunity:", error);
      res.status(500).json({ message: "Failed to create opportunity" });
    }
  });

  app.get('/api/business/opportunities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const businessProfile = await storage.getBusinessProfile(userId);
      
      if (!businessProfile) {
        return res.status(400).json({ message: "Business profile required" });
      }

      const opportunities = await storage.getBusinessOpportunities(businessProfile.id);
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching business opportunities:", error);
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  // Application routes
  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const studentProfile = await storage.getStudentProfile(userId);
      
      if (!studentProfile) {
        return res.status(400).json({ message: "Student profile required" });
      }

      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        studentProfileId: studentProfile.id,
      });

      const application = await storage.createApplication(applicationData);
      res.json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.get('/api/student/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const studentProfile = await storage.getStudentProfile(userId);
      
      if (!studentProfile) {
        return res.status(400).json({ message: "Student profile required" });
      }

      const applications = await storage.getApplicationsForStudent(studentProfile.id);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching student applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/opportunities/:id/applications', isAuthenticated, async (req: any, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify the user owns this opportunity
      const businessProfile = await storage.getBusinessProfile(userId);
      if (!businessProfile) {
        return res.status(403).json({ message: "Access denied" });
      }

      const opportunity = await storage.getOpportunity(opportunityId);
      if (!opportunity || opportunity.businessProfileId !== businessProfile.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const applications = await storage.getApplicationsForOpportunity(opportunityId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching opportunity applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.patch('/api/applications/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { status } = req.body;

      if (!['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const application = await storage.updateApplicationStatus(applicationId, status);
      res.json(application);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // Message routes
  app.get('/api/applications/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const messages = await storage.getMessagesForApplication(applicationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/applications/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { content } = req.body;

      const messageData = insertMessageSchema.parse({
        applicationId,
        senderId: userId,
        content,
      });

      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
