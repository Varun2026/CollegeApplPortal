import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// College Application Schema
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  encryptedData: text("encrypted_data").notNull(),
  iv: text("iv").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// Application data structure (before encryption)
export const applicationDataSchema = z.object({
  // Personal Information
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  
  // Academic Information
  course: z.string().min(2, "Course is required"),
  department: z.string().min(2, "Department is required"),
  gpa: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 4.0;
  }, "GPA must be between 0 and 4.0"),
  
  // Documents (base64 encoded)
  documents: z.array(z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    data: z.string(), // base64 encoded file data
  })).optional(),
});

export const insertApplicationSchema = createInsertSchema(applications).pick({
  encryptedData: true,
  iv: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export type ApplicationData = z.infer<typeof applicationDataSchema>;

// Keep existing user schema for reference
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
