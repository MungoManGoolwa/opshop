import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Extend Express Session type
declare module "express-session" {
  interface SessionData {
    user?: {
      claims: {
        sub: string;
        email: string;
        first_name: string;
        last_name: string;
        profile_image_url: string;
      };
      expires_at: number;
    };
  }
}

// Simple authentication for development - creates a test user
export async function setupSimpleAuth(app: Express) {
  
  // Simple login endpoint that creates a test user session
  app.get("/api/login", async (req, res) => {
    try {
      console.log("Login attempt - Session ID:", req.sessionID);
      
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

      // Set session data
      const sessionUser = {
        claims: {
          sub: testUser.id,
          email: testUser.email,
          first_name: testUser.firstName,
          last_name: testUser.lastName,
          profile_image_url: testUser.profileImageUrl
        },
        expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      };

      // Force session save
      req.session.user = sessionUser;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Session save failed" });
        }
        console.log("Session saved successfully for user:", testUser.id);
        res.redirect("/login-success");
      });
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
  const user = req.session?.user;

  console.log("Auth check - Session ID:", req.sessionID);
  console.log("Auth check - Session user exists:", !!user);

  if (!user || !user.expires_at) {
    console.log("No user or expires_at in session");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now > user.expires_at) {
    console.log("Session expired");
    return res.status(401).json({ message: "Session expired" });
  }

  // Attach user to request
  (req as any).user = user;
  console.log("Auth check passed for user:", user.claims.sub);
  next();
};