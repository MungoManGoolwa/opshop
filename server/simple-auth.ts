import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Simple authentication for development - creates a test user
export async function setupSimpleAuth(app: Express) {
  
  // Simple login endpoint that creates a test user session
  app.get("/api/login", async (req, res) => {
    try {
      // Create or get test user
      const testUser = {
        id: "test-user-1",
        email: "test@opshop.com",
        firstName: "Test",
        lastName: "User",
        profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        role: "admin" as const,
        isActive: true,
        isVerified: true
      };

      // Store user in database
      await storage.upsertUser(testUser);

      // Set session
      (req.session as any).user = {
        claims: {
          sub: testUser.id,
          email: testUser.email,
          first_name: testUser.firstName,
          last_name: testUser.lastName,
          profile_image_url: testUser.profileImageUrl
        },
        expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      };

      res.redirect("/");
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.get("/api/logout", (req, res) => {
    req.session?.destroy(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = (req.session as any)?.user;

  if (!user || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now > user.expires_at) {
    return res.status(401).json({ message: "Session expired" });
  }

  // Attach user to request
  (req as any).user = user;
  next();
};