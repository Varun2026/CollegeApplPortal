import type { Express } from "express";
import { createServer, type Server } from "http";
import { saveApplication, getApplications } from "./db";
import { encryptDataWithKeyVault, decryptDataWithKeyVault } from "./azureKeyVault";
import { insertApplicationSchema } from "@shared/schema";
import { z } from "zod";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  /**
   * POST /api/genai/score
   * AI analyzes GPA, course, department fit and gives score/feedback
   */
  app.post("/api/genai/score", async (req, res) => {
    try {
      const { gpa, course, department } = req.body;
      if (!gpa || !course || !department) return res.status(400).json({ error: "GPA, course, and department are required" });
      const { scoreApplicationQuality } = await import("./genaiScore");
      const scoreFeedback = await scoreApplicationQuality({ gpa, course, department });
      return res.status(200).json({ scoreFeedback });
    } catch (error) {
      return res.status(500).json({ error: "GenAI scoring failed", message: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  // Middleware for JSON parsing
  app.use(express.json({ limit: "50mb" })); // Increased limit for base64 encoded files

  /**
   * POST /api/genai/summarize
   * Generate a short summary of uploaded PDF text for admin preview
   */
  app.post("/api/genai/summarize", async (req, res) => {
    try {
      const { pdfText } = req.body;
      if (!pdfText) return res.status(400).json({ error: "PDF text is required" });
      const { summarizePdfText } = await import("./genai");
      const summary = await summarizePdfText(pdfText);
      return res.status(200).json({ summary });
    } catch (error) {
      return res.status(500).json({ error: "GenAI summary failed", message: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  /**
   * POST /api/applications
   * Submit a new encrypted college application
   * 
   * Request body:
   * {
   *   encryptedData: string (base64 encoded encrypted data),
   *   iv: string (base64 encoded initialization vector)
   * }
   */
  app.post("/api/applications", async (req, res) => {
    try {
      console.log("\n=== New Application Submission ===");
      console.log("Timestamp:", new Date().toISOString());

      // Validate request body
      const validationResult = insertApplicationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        console.error("Validation failed:", validationResult.error);
        return res.status(400).json({
          error: "Invalid request data",
          details: validationResult.error.errors,
        });
      }

      const applicationData = validationResult.data;

      // Additional validation
      if (!applicationData.encryptedData || !applicationData.iv) {
        console.error("Missing required fields");
        return res.status(400).json({
          error: "Missing encrypted data or IV",
        });
      }

      // Log encrypted data info (not the actual data for security)
      console.log("Encrypted data length:", applicationData.encryptedData.length);
      console.log("IV length:", applicationData.iv.length);

      // Encrypt data using Azure Key Vault
    const encryptedPayload = await encryptDataWithKeyVault(Buffer.from(applicationData.encryptedData, 'base64'));
    await saveApplication({ encryptedPayload: Buffer.from(encryptedPayload), iv: applicationData.iv });
      console.log("Application stored in Azure SQL");
      console.log("=================================\n");
      return res.status(201).json({
        success: true,
        message: "Application submitted successfully",
      });
    } catch (error) {
      console.error("Error processing application:", error);
      return res.status(500).json({
        error: "Failed to process application",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/applications
   * Retrieve all encrypted applications (for admin dashboard)
   * 
   * Returns array of applications with encrypted data
   */
  app.get("/api/applications", async (req, res) => {
    try {
      console.log("\n=== Admin: Fetching All Applications ===");
      
  const applications = await getApplications();
  console.log(`Found ${applications.length} applications in Azure SQL`);
  console.log("========================================\n");
  return res.status(200).json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      return res.status(500).json({
        error: "Failed to fetch applications",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/applications/:id
   * Retrieve a specific encrypted application by ID
   */
  app.get("/api/applications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`\n=== Fetching Application ${id} ===`);

      const applications = await getApplications();
  const application = applications.find((app: any) => app.id === id);
      if (!application) {
        console.log("Application not found");
        return res.status(404).json({ error: "Application not found" });
      }
      console.log("Application found");
      console.log("===================================\n");
      return res.status(200).json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      return res.status(500).json({
        error: "Failed to fetch application",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * Health check endpoint
   */
  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "College Application Encryption System",
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
