import { Request, Response } from 'express';
import { pool } from './db';
import { logger } from './config/logger';
import fs from 'fs';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceHealth;
    environment: ServiceHealth;
    memory: ServiceHealth;
    disk: ServiceHealth;
  };
  metrics: {
    requests: {
      total: number;
      success: number;
      errors: number;
      rate: number;
    };
    database: {
      connections: number;
      queries: number;
      errors: number;
    };
    performance: {
      avgResponseTime: number;
      memoryUsage: NodeJS.MemoryUsage;
      cpuUsage: NodeJS.CpuUsage;
    };
  };
}

interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  responseTime?: number;
  lastCheck: string;
}

// Global metrics collection
const metrics = {
  requests: {
    total: 0,
    success: 0,
    errors: 0,
    responseTimes: [] as number[],
  },
  database: {
    connections: 0,
    queries: 0,
    errors: 0,
  },
  startTime: Date.now(),
};

// Middleware to collect request metrics
export function collectRequestMetrics(req: Request, res: Response, next: Function) {
  const start = Date.now();
  
  metrics.requests.total++;
  
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    metrics.requests.responseTimes.push(duration);
    
    // Keep only last 1000 response times for memory efficiency
    if (metrics.requests.responseTimes.length > 1000) {
      metrics.requests.responseTimes = metrics.requests.responseTimes.slice(-500);
    }
    
    if (res.statusCode >= 200 && res.statusCode < 400) {
      metrics.requests.success++;
    } else {
      metrics.requests.errors++;
    }
    
    return originalSend.call(this, data);
  };
  
  next();
}

// Database health check
async function checkDatabaseHealth(): Promise<ServiceHealth> {
  const start = Date.now();
  
  try {
    const result = await pool.query('SELECT 1 as healthy, NOW() as timestamp');
    const responseTime = Date.now() - start;
    
    if (result.rows.length > 0) {
      return {
        status: 'healthy',
        responseTime,
        lastCheck: new Date().toISOString(),
        message: 'Database connection successful'
      };
    } else {
      return {
        status: 'unhealthy',
        responseTime,
        lastCheck: new Date().toISOString(),
        message: 'Database query returned no results'
      };
    }
  } catch (error) {
    const responseTime = Date.now() - start;
    logger.error('Database health check failed', { error: (error as Error).message });
    
    return {
      status: 'unhealthy',
      responseTime,
      lastCheck: new Date().toISOString(),
      message: `Database connection failed: ${(error as Error).message}`
    };
  }
}

// Environment health check
function checkEnvironmentHealth(): ServiceHealth {
  const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET'];
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    return {
      status: 'unhealthy',
      lastCheck: new Date().toISOString(),
      message: `Missing required environment variables: ${missing.join(', ')}`
    };
  }
  
  return {
    status: 'healthy',
    lastCheck: new Date().toISOString(),
    message: 'All required environment variables present'
  };
}

// Memory health check
function checkMemoryHealth(): ServiceHealth {
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024),
  };
  
  // Warning thresholds (in MB)
  const WARNING_HEAP = 500;
  const CRITICAL_HEAP = 1000;
  
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  let message = `Memory usage: ${memUsageMB.heapUsed}MB heap, ${memUsageMB.rss}MB RSS`;
  
  if (memUsageMB.heapUsed > CRITICAL_HEAP) {
    status = 'unhealthy';
    message += ' - CRITICAL: High memory usage';
  } else if (memUsageMB.heapUsed > WARNING_HEAP) {
    status = 'degraded';
    message += ' - WARNING: Elevated memory usage';
  }
  
  return {
    status,
    lastCheck: new Date().toISOString(),
    message
  };
}

// Disk health check (simplified for container environments)
function checkDiskHealth(): ServiceHealth {
  try {
    const stats = fs.statSync('/tmp');
    
    return {
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      message: 'Disk access healthy'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      lastCheck: new Date().toISOString(),
      message: `Disk access failed: ${(error as Error).message}`
    };
  }
}

// Calculate average response time
function getAverageResponseTime(): number {
  if (metrics.requests.responseTimes.length === 0) return 0;
  
  const sum = metrics.requests.responseTimes.reduce((a, b) => a + b, 0);
  return Math.round(sum / metrics.requests.responseTimes.length);
}

// Calculate request rate (requests per minute)
function getRequestRate(): number {
  const uptimeMinutes = (Date.now() - metrics.startTime) / 1000 / 60;
  return uptimeMinutes > 0 ? Math.round(metrics.requests.total / uptimeMinutes) : 0;
}

// Health check endpoint
export async function healthCheck(req: Request, res: Response) {
  try {
    const [dbHealth, envHealth, memHealth, diskHealth] = await Promise.all([
      checkDatabaseHealth(),
      Promise.resolve(checkEnvironmentHealth()),
      Promise.resolve(checkMemoryHealth()),
      Promise.resolve(checkDiskHealth())
    ]);
    
    const services = {
      database: dbHealth,
      environment: envHealth,
      memory: memHealth,
      disk: diskHealth
    };
    
    // Determine overall status
    const serviceStatuses = Object.values(services).map(s => s.status);
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (serviceStatuses.includes('unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (serviceStatuses.includes('degraded')) {
      overallStatus = 'degraded';
    }
    
    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.round((Date.now() - metrics.startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services,
      metrics: {
        requests: {
          total: metrics.requests.total,
          success: metrics.requests.success,
          errors: metrics.requests.errors,
          rate: getRequestRate()
        },
        database: {
          connections: metrics.database.connections,
          queries: metrics.database.queries,
          errors: metrics.database.errors
        },
        performance: {
          avgResponseTime: getAverageResponseTime(),
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage()
        }
      }
    };
    
    // Log health check
    logger.info('Health check performed', {
      status: overallStatus,
      responseTime: services.database.responseTime,
      type: 'health_check'
    });
    
    // Set HTTP status based on health
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;
    
    res.status(httpStatus).json(healthStatus);
    
  } catch (error) {
    logger.error('Health check failed', { error: (error as Error).message });
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: (error as Error).message
    });
  }
}

// Metrics endpoint
export function metricsEndpoint(req: Request, res: Response) {
  try {
    const uptime = (Date.now() - metrics.startTime) / 1000;
    const memUsage = process.memoryUsage();
    
    const metricsData = {
      timestamp: new Date().toISOString(),
      uptime: Math.round(uptime),
      requests: {
        total: metrics.requests.total,
        success: metrics.requests.success,
        errors: metrics.requests.errors,
        error_rate: metrics.requests.total > 0 ? 
          Math.round((metrics.requests.errors / metrics.requests.total) * 100) : 0,
        avg_response_time: getAverageResponseTime(),
        requests_per_minute: getRequestRate()
      },
      database: {
        connections: metrics.database.connections,
        queries: metrics.database.queries,
        errors: metrics.database.errors,
        error_rate: metrics.database.queries > 0 ? 
          Math.round((metrics.database.errors / metrics.database.queries) * 100) : 0
      },
      system: {
        memory: {
          rss: Math.round(memUsage.rss / 1024 / 1024),
          heap_total: Math.round(memUsage.heapTotal / 1024 / 1024),
          heap_used: Math.round(memUsage.heapUsed / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024)
        },
        cpu: process.cpuUsage(),
        node_version: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };
    
    res.json(metricsData);
    
  } catch (error) {
    logger.error('Metrics endpoint failed', { error: (error as Error).message });
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
}

// Ready check - simpler check for container orchestration
export async function readinessCheck(req: Request, res: Response) {
  try {
    // Quick database ping
    await pool.query('SELECT 1');
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Readiness check failed', { error: (error as Error).message });
    
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: (error as Error).message
    });
  }
}

// Liveness check - basic server responsiveness
export function livenessCheck(req: Request, res: Response) {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: Math.round((Date.now() - metrics.startTime) / 1000)
  });
}

// Database metrics collection
export function trackDatabaseQuery(duration: number, error?: boolean) {
  metrics.database.queries++;
  if (error) {
    metrics.database.errors++;
  }
}

export function trackDatabaseConnection() {
  metrics.database.connections++;
}

// Export metrics for external monitoring
export function getMetrics() {
  return metrics;
}