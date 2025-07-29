import type { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

// Admin audit log entry interface
export interface AdminAuditEntry {
  id?: number;
  adminUserId: string;
  action: string;
  targetType: string;
  targetId?: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

// Audit log storage (in-memory for now, should be moved to database)
const auditLogs: AdminAuditEntry[] = [];
let auditIdCounter = 1;

// Log admin action
export function logAdminAction(entry: Omit<AdminAuditEntry, 'id' | 'timestamp'>) {
  const auditEntry: AdminAuditEntry = {
    id: auditIdCounter++,
    ...entry,
    timestamp: new Date(),
  };
  
  auditLogs.push(auditEntry);
  
  // Keep only last 10000 entries in memory
  if (auditLogs.length > 10000) {
    auditLogs.splice(0, auditLogs.length - 10000);
  }
  
  // Log to console for monitoring
  console.log(`ADMIN_AUDIT: ${entry.adminUserId} performed ${entry.action} on ${entry.targetType}${entry.targetId ? ` (ID: ${entry.targetId})` : ''}`, {
    success: entry.success,
    details: entry.details,
    ip: entry.ipAddress,
    timestamp: auditEntry.timestamp
  });
  
  return auditEntry;
}

// Middleware to audit admin actions
export function auditAdminAction(action: string, targetType: string) {
  return (req: any, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Get admin user info
    const adminUserId = req.user?.claims?.sub;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    // Extract target ID from request
    const targetId = req.params.id || req.params.userId || req.params.productId || req.params.orderId || req.body.id;
    
    // Capture response to determine success
    let responseData: any;
    let success = true;
    let errorMessage: string | undefined;
    
    res.send = function(data: any) {
      responseData = data;
      success = res.statusCode < 400;
      if (!success) {
        try {
          const errorData = typeof data === 'string' ? JSON.parse(data) : data;
          errorMessage = errorData.message || errorData.error || 'Unknown error';
        } catch {
          errorMessage = String(data);
        }
      }
      return originalSend.call(this, data);
    };
    
    res.json = function(data: any) {
      responseData = data;
      success = res.statusCode < 400;
      if (!success) {
        errorMessage = data.message || data.error || 'Unknown error';
      }
      return originalJson.call(this, data);
    };
    
    // Log the action after response
    res.on('finish', () => {
      logAdminAction({
        adminUserId: adminUserId || 'unknown',
        action,
        targetType,
        targetId,
        details: {
          method: req.method,
          path: req.path,
          query: req.query,
          body: req.body,
          response: responseData
        },
        ipAddress,
        userAgent,
        success,
        errorMessage
      });
    });
    
    next();
  };
}

// Get audit logs with filtering
export function getAuditLogs(filters?: {
  adminUserId?: string;
  action?: string;
  targetType?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  limit?: number;
  offset?: number;
}) {
  let filteredLogs = [...auditLogs];
  
  if (filters) {
    if (filters.adminUserId) {
      filteredLogs = filteredLogs.filter(log => log.adminUserId === filters.adminUserId);
    }
    
    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action.includes(filters.action!));
    }
    
    if (filters.targetType) {
      filteredLogs = filteredLogs.filter(log => log.targetType === filters.targetType);
    }
    
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
    }
    
    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
    }
    
    if (filters.success !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.success === filters.success);
    }
  }
  
  // Sort by timestamp (newest first)
  filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  // Apply pagination
  const offset = filters?.offset || 0;
  const limit = filters?.limit || 100;
  
  return {
    logs: filteredLogs.slice(offset, offset + limit),
    total: filteredLogs.length,
    offset,
    limit
  };
}

// Get audit statistics
export function getAuditStatistics(timeRange?: { startDate: Date; endDate: Date }) {
  let logs = auditLogs;
  
  if (timeRange) {
    logs = logs.filter(log => 
      log.timestamp >= timeRange.startDate && 
      log.timestamp <= timeRange.endDate
    );
  }
  
  const totalActions = logs.length;
  const successfulActions = logs.filter(log => log.success).length;
  const failedActions = totalActions - successfulActions;
  
  // Group by action type
  const actionCounts: Record<string, number> = {};
  logs.forEach(log => {
    actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
  });
  
  // Group by admin user
  const adminCounts: Record<string, number> = {};
  logs.forEach(log => {
    adminCounts[log.adminUserId] = (adminCounts[log.adminUserId] || 0) + 1;
  });
  
  // Group by target type
  const targetTypeCounts: Record<string, number> = {};
  logs.forEach(log => {
    targetTypeCounts[log.targetType] = (targetTypeCounts[log.targetType] || 0) + 1;
  });
  
  return {
    totalActions,
    successfulActions,
    failedActions,
    successRate: totalActions > 0 ? (successfulActions / totalActions) * 100 : 0,
    actionCounts,
    adminCounts,
    targetTypeCounts,
    timeRange: timeRange || {
      startDate: logs.length > 0 ? new Date(Math.min(...logs.map(l => l.timestamp.getTime()))) : new Date(),
      endDate: logs.length > 0 ? new Date(Math.max(...logs.map(l => l.timestamp.getTime()))) : new Date()
    }
  };
}