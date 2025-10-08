import { type Application, type InsertApplication } from "@shared/schema";
import { randomUUID } from "crypto";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * Storage interface for college applications
 * Handles CRUD operations for encrypted application data
 */
export interface IStorage {
  // Application methods
  createApplication(application: InsertApplication): Promise<Application>;
  getAllApplications(): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
}

/**
 * File-based storage implementation
 * Stores encrypted applications in applications.json
 */
export class FileStorage implements IStorage {
  private filePath: string;
  private applications: Map<string, Application>;
  private initialized: boolean = false;

  constructor() {
    // Store applications.json in the project root
    this.filePath = path.join(process.cwd(), "applications.json");
    this.applications = new Map();
  }

  /**
   * Initialize storage by loading existing data from file
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Check if file exists
      await fs.access(this.filePath);
      
      // Read and parse existing data
      const data = await fs.readFile(this.filePath, "utf-8");
      const applications = JSON.parse(data) as Application[];
      
      // Load into memory
      applications.forEach((app) => {
        this.applications.set(app.id, {
          ...app,
          submittedAt: new Date(app.submittedAt), // Convert string back to Date
        });
      });
      
      console.log(`Loaded ${applications.length} applications from storage`);
    } catch (error: any) {
      // File doesn't exist yet, create empty file
      if (error.code === "ENOENT") {
        await this.saveToFile();
        console.log("Created new applications.json file");
      } else {
        console.error("Error initializing storage:", error);
      }
    }

    this.initialized = true;
  }

  /**
   * Save current applications to file
   */
  private async saveToFile(): Promise<void> {
    const applications = Array.from(this.applications.values());
    const data = JSON.stringify(applications, null, 2);
    await fs.writeFile(this.filePath, data, "utf-8");
  }

  /**
   * Create a new encrypted application
   */
  async createApplication(insertApp: InsertApplication): Promise<Application> {
    await this.initialize();

    const id = randomUUID();
    const application: Application = {
      id,
      encryptedData: insertApp.encryptedData,
      iv: insertApp.iv,
      submittedAt: new Date(),
    };

    // Store in memory
    this.applications.set(id, application);

    // Persist to file
    await this.saveToFile();

    console.log(`Application ${id} stored successfully`);
    console.log(`- Encrypted data length: ${insertApp.encryptedData.length} bytes`);
    console.log(`- IV: ${insertApp.iv}`);

    return application;
  }

  /**
   * Get all applications (for admin dashboard)
   */
  async getAllApplications(): Promise<Application[]> {
    await this.initialize();
    return Array.from(this.applications.values()).sort(
      (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()
    );
  }

  /**
   * Get a specific application by ID
   */
  async getApplication(id: string): Promise<Application | undefined> {
    await this.initialize();
    return this.applications.get(id);
  }
}

// Export singleton instance
export const storage = new FileStorage();
