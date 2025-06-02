import {
  users,
  studentProfiles,
  businessProfiles,
  opportunities,
  applications,
  messages,
  type User,
  type UpsertUser,
  type StudentProfile,
  type InsertStudentProfile,
  type BusinessProfile,
  type InsertBusinessProfile,
  type Opportunity,
  type InsertOpportunity,
  type Application,
  type InsertApplication,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Student profile operations
  getStudentProfile(userId: string): Promise<StudentProfile | undefined>;
  createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;
  updateStudentProfile(userId: string, profile: Partial<InsertStudentProfile>): Promise<StudentProfile>;
  
  // Business profile operations
  getBusinessProfile(userId: string): Promise<BusinessProfile | undefined>;
  createBusinessProfile(profile: InsertBusinessProfile): Promise<BusinessProfile>;
  updateBusinessProfile(userId: string, profile: Partial<InsertBusinessProfile>): Promise<BusinessProfile>;
  
  // Opportunity operations
  getOpportunities(filters?: { industry?: string; location?: string; isRemote?: boolean }): Promise<Opportunity[]>;
  getOpportunity(id: number): Promise<Opportunity | undefined>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  updateOpportunity(id: number, opportunity: Partial<InsertOpportunity>): Promise<Opportunity>;
  getBusinessOpportunities(businessProfileId: number): Promise<Opportunity[]>;
  
  // Application operations
  getApplicationsForStudent(studentProfileId: number): Promise<Application[]>;
  getApplicationsForOpportunity(opportunityId: number): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<Application>;
  
  // Message operations
  getMessagesForApplication(applicationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Student profile operations
  async getStudentProfile(userId: string): Promise<StudentProfile | undefined> {
    const [profile] = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, userId));
    return profile;
  }

  async createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile> {
    const [newProfile] = await db
      .insert(studentProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateStudentProfile(userId: string, profile: Partial<InsertStudentProfile>): Promise<StudentProfile> {
    const [updatedProfile] = await db
      .update(studentProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(studentProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Business profile operations
  async getBusinessProfile(userId: string): Promise<BusinessProfile | undefined> {
    const [profile] = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId));
    return profile;
  }

  async createBusinessProfile(profile: InsertBusinessProfile): Promise<BusinessProfile> {
    const [newProfile] = await db
      .insert(businessProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateBusinessProfile(userId: string, profile: Partial<InsertBusinessProfile>): Promise<BusinessProfile> {
    const [updatedProfile] = await db
      .update(businessProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(businessProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Opportunity operations
  async getOpportunities(filters?: { industry?: string; location?: string; isRemote?: boolean }): Promise<Opportunity[]> {
    let query = db.select().from(opportunities).where(eq(opportunities.status, "active"));
    
    if (filters?.industry) {
      query = query.where(eq(opportunities.industry, filters.industry));
    }
    
    if (filters?.location) {
      query = query.where(eq(opportunities.location, filters.location));
    }
    
    if (filters?.isRemote !== undefined) {
      query = query.where(eq(opportunities.isRemote, filters.isRemote));
    }
    
    return await query.orderBy(desc(opportunities.createdAt));
  }

  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    const [opportunity] = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, id));
    return opportunity;
  }

  async createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    const [newOpportunity] = await db
      .insert(opportunities)
      .values(opportunity)
      .returning();
    return newOpportunity;
  }

  async updateOpportunity(id: number, opportunity: Partial<InsertOpportunity>): Promise<Opportunity> {
    const [updatedOpportunity] = await db
      .update(opportunities)
      .set({ ...opportunity, updatedAt: new Date() })
      .where(eq(opportunities.id, id))
      .returning();
    return updatedOpportunity;
  }

  async getBusinessOpportunities(businessProfileId: number): Promise<Opportunity[]> {
    return await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.businessProfileId, businessProfileId))
      .orderBy(desc(opportunities.createdAt));
  }

  // Application operations
  async getApplicationsForStudent(studentProfileId: number): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.studentProfileId, studentProfileId))
      .orderBy(desc(applications.appliedAt));
  }

  async getApplicationsForOpportunity(opportunityId: number): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.opportunityId, opportunityId))
      .orderBy(desc(applications.appliedAt));
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db
      .insert(applications)
      .values(application)
      .returning();
    return newApplication;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application> {
    const [updatedApplication] = await db
      .update(applications)
      .set({ status, respondedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return updatedApplication;
  }

  // Message operations
  async getMessagesForApplication(applicationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.applicationId, applicationId))
      .orderBy(asc(messages.sentAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }
}

export const storage = new DatabaseStorage();
