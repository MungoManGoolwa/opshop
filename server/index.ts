import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { env, checkRequiredServices, checkOptionalServices, logEnvironmentInfo } from "./config/env";
import { logger, requestLogger, errorLogger } from "./config/logger";

const app = express();

// Trust proxy for production deployment
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add structured request logging
app.use(requestLogger);

(async () => {
  // Check environment configuration
  checkRequiredServices();
  checkOptionalServices();
  logEnvironmentInfo();

  const server = await registerRoutes(app);

  // Add structured error logging
  app.use(errorLogger);
  
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = env.PORT;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    logger.info({
      type: 'server_start',
      port,
      environment: env.NODE_ENV,
      nodeVersion: process.version,
    }, `Server started on port ${port}`);
  });
})();
