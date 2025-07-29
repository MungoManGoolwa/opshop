/**
 * Advanced monitoring and alerting system for Opshop Online
 * Provides comprehensive observability for business metrics and system health
 */

import { logger, businessLogger } from './config/logger';
import { db } from './db';
import { sql } from 'drizzle-orm';

interface BusinessMetrics {
  sales: {
    daily: number;
    weekly: number;
    monthly: number;
    trend: 'up' | 'down' | 'stable';
  };
  listings: {
    active: number;
    new_today: number;
    conversion_rate: number;
  };
  users: {
    active_daily: number;
    new_registrations: number;
    retention_rate: number;
  };
  buyback: {
    offers_pending: number;
    acceptance_rate: number;
    avg_offer_value: number;
  };
  financial: {
    revenue_today: number;
    commission_earned: number;
    pending_payouts: number;
  };
}

interface SystemAlerts {
  critical: Alert[];
  warnings: Alert[];
  info: Alert[];
}

interface Alert {
  type: 'performance' | 'business' | 'security' | 'system';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  details?: any;
}

// Business metrics calculation
export async function getBusinessMetrics(): Promise<BusinessMetrics> {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Sales metrics
    const salesResults = await db.execute(sql`
      SELECT 
        SUM(CASE WHEN created_at >= ${todayStart} THEN total_amount ELSE 0 END) as daily_sales,
        SUM(CASE WHEN created_at >= ${weekStart} THEN total_amount ELSE 0 END) as weekly_sales,
        SUM(CASE WHEN created_at >= ${monthStart} THEN total_amount ELSE 0 END) as monthly_sales,
        COUNT(CASE WHEN created_at >= ${todayStart} THEN 1 END) as daily_orders
      FROM orders 
      WHERE status = 'completed'
    `);

    // Listings metrics
    const listingsResults = await db.execute(sql`
      SELECT 
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_listings,
        COUNT(CASE WHEN created_at >= ${todayStart} THEN 1 END) as new_today,
        COUNT(CASE WHEN status = 'sold' AND updated_at >= ${monthStart} THEN 1 END) as sold_monthly,
        COUNT(CASE WHEN created_at >= ${monthStart} THEN 1 END) as created_monthly
      FROM products
    `);

    // User metrics
    const userResults = await db.execute(sql`
      SELECT 
        COUNT(CASE WHEN last_login >= ${todayStart} THEN 1 END) as active_daily,
        COUNT(CASE WHEN created_at >= ${todayStart} THEN 1 END) as new_registrations,
        COUNT(*) as total_users
      FROM users
    `);

    // Buyback metrics
    const buybackResults = await db.execute(sql`
      SELECT 
        COUNT(CASE WHEN status = 'pending_admin_review' THEN 1 END) as pending_offers,
        COUNT(CASE WHEN status = 'accepted' AND created_at >= ${monthStart} THEN 1 END) as accepted_monthly,
        COUNT(CASE WHEN created_at >= ${monthStart} THEN 1 END) as total_monthly,
        AVG(CASE WHEN status = 'accepted' THEN offer_price END) as avg_offer_value
      FROM buyback_offers
    `);

    // Financial metrics
    const financialResults = await db.execute(sql`
      SELECT 
        SUM(CASE WHEN created_at >= ${todayStart} THEN amount ELSE 0 END) as revenue_today,
        SUM(CASE WHEN created_at >= ${todayStart} THEN commission_amount ELSE 0 END) as commission_today
      FROM commissions
    `);

    const pendingPayouts = await db.execute(sql`
      SELECT SUM(amount) as pending_amount 
      FROM payouts 
      WHERE status = 'pending'
    `);

    const sales = salesResults[0];
    const listings = listingsResults[0];
    const users = userResults[0];
    const buyback = buybackResults[0];
    const financial = financialResults[0];
    const payouts = pendingPayouts[0];

    // Calculate conversion rate
    const conversionRate = listings.created_monthly > 0 ? 
      (Number(listings.sold_monthly) / Number(listings.created_monthly)) * 100 : 0;

    // Calculate buyback acceptance rate
    const acceptanceRate = buyback.total_monthly > 0 ? 
      (Number(buyback.accepted_monthly) / Number(buyback.total_monthly)) * 100 : 0;

    // Calculate retention rate (simplified - users who logged in this week vs last week)
    const retentionRate = Number(users.total_users) > 0 ? 
      (Number(users.active_daily) / Number(users.total_users)) * 100 : 0;

    // Determine sales trend (simplified)
    const salesTrend: 'up' | 'down' | 'stable' = 
      Number(sales.daily_sales) > Number(sales.weekly_sales) / 7 ? 'up' :
      Number(sales.daily_sales) < Number(sales.weekly_sales) / 7 * 0.8 ? 'down' : 'stable';

    return {
      sales: {
        daily: Number(sales.daily_sales) || 0,
        weekly: Number(sales.weekly_sales) || 0,
        monthly: Number(sales.monthly_sales) || 0,
        trend: salesTrend
      },
      listings: {
        active: Number(listings.active_listings) || 0,
        new_today: Number(listings.new_today) || 0,
        conversion_rate: Math.round(conversionRate * 100) / 100
      },
      users: {
        active_daily: Number(users.active_daily) || 0,
        new_registrations: Number(users.new_registrations) || 0,
        retention_rate: Math.round(retentionRate * 100) / 100
      },
      buyback: {
        offers_pending: Number(buyback.pending_offers) || 0,
        acceptance_rate: Math.round(acceptanceRate * 100) / 100,
        avg_offer_value: Number(buyback.avg_offer_value) || 0
      },
      financial: {
        revenue_today: Number(financial.revenue_today) || 0,
        commission_earned: Number(financial.commission_today) || 0,
        pending_payouts: Number(payouts.pending_amount) || 0
      }
    };

  } catch (error) {
    logger.error('Failed to calculate business metrics', { error: (error as Error).message });
    throw error;
  }
}

// System alerts generation
export async function generateSystemAlerts(): Promise<SystemAlerts> {
  const alerts: SystemAlerts = {
    critical: [],
    warnings: [],
    info: []
  };

  try {
    const metrics = await getBusinessMetrics();

    // Business alert rules
    if (metrics.buyback.offers_pending > 10) {
      alerts.warnings.push({
        type: 'business',
        severity: 'warning',
        message: `${metrics.buyback.offers_pending} buyback offers pending admin review`,
        timestamp: new Date().toISOString(),
        details: { pending_count: metrics.buyback.offers_pending }
      });
    }

    if (metrics.listings.conversion_rate < 5) {
      alerts.warnings.push({
        type: 'business',
        severity: 'warning',
        message: `Low listing conversion rate: ${metrics.listings.conversion_rate}%`,
        timestamp: new Date().toISOString(),
        details: { conversion_rate: metrics.listings.conversion_rate }
      });
    }

    if (metrics.financial.pending_payouts > 10000) {
      alerts.critical.push({
        type: 'business',
        severity: 'critical',
        message: `High pending payouts: $${metrics.financial.pending_payouts}`,
        timestamp: new Date().toISOString(),
        details: { amount: metrics.financial.pending_payouts }
      });
    }

    // System performance alerts
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);

    if (heapUsedMB > 1000) {
      alerts.critical.push({
        type: 'system',
        severity: 'critical',
        message: `Critical memory usage: ${heapUsedMB}MB`,
        timestamp: new Date().toISOString(),
        details: { memory_usage: heapUsedMB }
      });
    } else if (heapUsedMB > 500) {
      alerts.warnings.push({
        type: 'system',
        severity: 'warning',
        message: `High memory usage: ${heapUsedMB}MB`,
        timestamp: new Date().toISOString(),
        details: { memory_usage: heapUsedMB }
      });
    }

    // Info alerts for positive trends
    if (metrics.sales.trend === 'up') {
      alerts.info.push({
        type: 'business',
        severity: 'info',
        message: `Sales trending upward - $${metrics.sales.daily} today`,
        timestamp: new Date().toISOString(),
        details: { daily_sales: metrics.sales.daily }
      });
    }

    if (metrics.users.new_registrations > 10) {
      alerts.info.push({
        type: 'business',
        severity: 'info',
        message: `Strong user growth: ${metrics.users.new_registrations} new registrations today`,
        timestamp: new Date().toISOString(),
        details: { new_users: metrics.users.new_registrations }
      });
    }

  } catch (error) {
    alerts.critical.push({
      type: 'system',
      severity: 'critical',
      message: 'Failed to generate system alerts',
      timestamp: new Date().toISOString(),
      details: { error: (error as Error).message }
    });
  }

  return alerts;
}

// Monitoring dashboard endpoint
export async function monitoringDashboard(req: any, res: any) {
  try {
    const [businessMetrics, systemAlerts] = await Promise.all([
      getBusinessMetrics(),
      generateSystemAlerts()
    ]);

    const dashboard = {
      timestamp: new Date().toISOString(),
      status: systemAlerts.critical.length > 0 ? 'critical' : 
              systemAlerts.warnings.length > 0 ? 'warning' : 'healthy',
      business_metrics: businessMetrics,
      alerts: systemAlerts,
      summary: {
        total_alerts: systemAlerts.critical.length + systemAlerts.warnings.length + systemAlerts.info.length,
        critical_issues: systemAlerts.critical.length,
        warnings: systemAlerts.warnings.length,
        daily_revenue: businessMetrics.financial.revenue_today,
        active_users: businessMetrics.users.active_daily,
        pending_actions: businessMetrics.buyback.offers_pending
      }
    };

    // Log monitoring access
    businessLogger.listing.created('monitoring_dashboard_accessed', req.user?.claims?.sub || 'anonymous', 'admin');

    res.json(dashboard);

  } catch (error) {
    logger.error('Monitoring dashboard failed', { error: (error as Error).message });
    res.status(500).json({ 
      error: 'Failed to load monitoring dashboard',
      timestamp: new Date().toISOString()
    });
  }
}

// Automated alert processor
export async function processAutomatedAlerts() {
  try {
    const alerts = await generateSystemAlerts();
    
    // Log critical alerts
    alerts.critical.forEach(alert => {
      logger.error('Critical alert generated', {
        type: alert.type,
        message: alert.message,
        details: alert.details
      });
    });

    // Log warning alerts
    alerts.warnings.forEach(alert => {
      logger.warn('Warning alert generated', {
        type: alert.type,
        message: alert.message,
        details: alert.details
      });
    });

    // In a production environment, you would send these alerts to:
    // - Slack notifications
    // - Email alerts
    // - PagerDuty incidents
    // - Monitoring dashboards

    return alerts;

  } catch (error) {
    logger.error('Automated alert processing failed', { error: (error as Error).message });
    throw error;
  }
}

// Export monitoring functions
export {
  BusinessMetrics,
  SystemAlerts,
  Alert
};