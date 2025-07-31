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
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        accountType: "admin" as const,
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
        
        // Send HTML page that will handle redirect and auth refresh
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Login Success - Opshop Online</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
              .container { text-align: center; background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); max-width: 400px; }
              .spinner { width: 40px; height: 40px; border: 4px solid #f3f4f6; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              h1 { color: #111827; margin-bottom: 0.5rem; }
              p { color: #6b7280; margin-bottom: 1rem; }
              .countdown { font-size: 1.25rem; font-weight: bold; color: #667eea; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="spinner"></div>
              <h1>Login Successful!</h1>
              <p>Welcome to Opshop Online marketplace</p>
              <p class="countdown">Redirecting in <span id="countdown">3</span> seconds...</p>
            </div>
            <script>
              let count = 3;
              const countdownEl = document.getElementById('countdown');
              const timer = setInterval(() => {
                count--;
                countdownEl.textContent = count;
                if (count <= 0) {
                  clearInterval(timer);
                  window.location.href = '/';
                }
              }, 1000);
            </script>
          </body>
          </html>
        `);
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