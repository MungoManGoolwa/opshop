# Health Checks and Metrics Monitoring Guide

## Overview

Opshop Online now includes comprehensive health checks and metrics endpoints providing real-time system observability, business intelligence, and automated alerting capabilities.

## Health Check Endpoints

### 1. **Comprehensive Health Check**
- **Endpoint**: `GET /health`
- **Purpose**: Complete system health assessment
- **Authentication**: Public (no auth required)

**Response Example**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-29T02:52:57.162Z",
  "uptime": 1847,
  "version": "1.0.0",
  "environment": "development",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 23,
      "lastCheck": "2025-01-29T02:52:57.140Z",
      "message": "Database connection successful"
    },
    "environment": {
      "status": "healthy",
      "lastCheck": "2025-01-29T02:52:57.141Z",
      "message": "All required environment variables present"
    },
    "memory": {
      "status": "healthy",
      "lastCheck": "2025-01-29T02:52:57.141Z",
      "message": "Memory usage: 89MB heap, 167MB RSS"
    },
    "disk": {
      "status": "healthy",
      "lastCheck": "2025-01-29T02:52:57.141Z",
      "message": "Disk access healthy"
    }
  },
  "metrics": {
    "requests": {
      "total": 156,
      "success": 120,
      "errors": 36,
      "rate": 5
    },
    "database": {
      "connections": 0,
      "queries": 0,
      "errors": 0
    },
    "performance": {
      "avgResponseTime": 72,
      "memoryUsage": {
        "rss": 175439872,
        "heapTotal": 118845440,
        "heapUsed": 93779528,
        "external": 2737138
      },
      "cpuUsage": {
        "user": 2515625,
        "system": 562500
      }
    }
  }
}
```

**Status Codes**:
- `200` - Healthy or degraded
- `503` - Unhealthy

### 2. **Readiness Check**
- **Endpoint**: `GET /health/ready`
- **Purpose**: Container orchestration readiness
- **Authentication**: Public

**Response Example**:
```json
{
  "status": "ready",
  "timestamp": "2025-01-29T02:52:57.200Z"
}
```

**Status Codes**:
- `200` - Ready to serve traffic
- `503` - Not ready (database connectivity issues)

### 3. **Liveness Check**
- **Endpoint**: `GET /health/live`
- **Purpose**: Basic server responsiveness
- **Authentication**: Public

**Response Example**:
```json
{
  "status": "alive",
  "timestamp": "2025-01-29T02:52:57.250Z",
  "uptime": 1847
}
```

**Status Codes**:
- `200` - Server responsive

## Metrics Endpoint

### **System Metrics**
- **Endpoint**: `GET /metrics`
- **Purpose**: Detailed performance and business metrics
- **Authentication**: Public

**Response Example**:
```json
{
  "timestamp": "2025-01-29T02:52:57.634Z",
  "uptime": 1848,
  "requests": {
    "total": 158,
    "success": 121,
    "errors": 37,
    "error_rate": 23,
    "avg_response_time": 72,
    "requests_per_minute": 5
  },
  "database": {
    "connections": 0,
    "queries": 0,
    "errors": 0,
    "error_rate": 0
  },
  "system": {
    "memory": {
      "rss": 167,
      "heap_total": 113,
      "heap_used": 89,
      "external": 3
    },
    "cpu": {
      "user": 2546875,
      "system": 562500
    },
    "node_version": "v20.19.3",
    "platform": "linux",
    "arch": "x64"
  }
}
```

## Business Monitoring Dashboard

### **Admin Monitoring Dashboard**
- **Endpoint**: `GET /api/admin/monitoring`
- **Purpose**: Business intelligence and system alerts
- **Authentication**: Required (admin users only)

**Features**:
- Sales metrics (daily, weekly, monthly trends)
- User activity analytics (registrations, retention)
- Listing performance (conversion rates, active listings)
- Buyback system monitoring (pending offers, acceptance rates)
- Financial tracking (revenue, commissions, pending payouts)
- System alerts and warnings

**Response Example**:
```json
{
  "timestamp": "2025-01-29T02:53:00.000Z",
  "status": "healthy",
  "business_metrics": {
    "sales": {
      "daily": 1250.00,
      "weekly": 8750.00,
      "monthly": 32500.00,
      "trend": "up"
    },
    "listings": {
      "active": 2847,
      "new_today": 45,
      "conversion_rate": 12.5
    },
    "users": {
      "active_daily": 189,
      "new_registrations": 23,
      "retention_rate": 68.2
    },
    "buyback": {
      "offers_pending": 7,
      "acceptance_rate": 78.5,
      "avg_offer_value": 85.50
    },
    "financial": {
      "revenue_today": 1250.00,
      "commission_earned": 125.00,
      "pending_payouts": 3400.00
    }
  },
  "alerts": {
    "critical": [],
    "warnings": [],
    "info": [
      {
        "type": "business",
        "severity": "info",
        "message": "Sales trending upward - $1250 today",
        "timestamp": "2025-01-29T02:53:00.000Z",
        "details": { "daily_sales": 1250 }
      }
    ]
  },
  "summary": {
    "total_alerts": 1,
    "critical_issues": 0,
    "warnings": 0,
    "daily_revenue": 1250.00,
    "active_users": 189,
    "pending_actions": 7
  }
}
```

## Health Status Definitions

### Service Health States
- **healthy** - Service operating normally
- **degraded** - Service operational but performance impacted
- **unhealthy** - Service not operational or experiencing critical issues

### Overall System Status
- **healthy** - All services healthy
- **degraded** - One or more services degraded, but system functional
- **unhealthy** - Critical services unhealthy, system compromised

## Automated Monitoring Features

### **Request Tracking**
- Unique request IDs for tracing
- Response time monitoring
- Success/error rate calculation
- Automatic request/response logging

### **Performance Monitoring**
- Memory usage tracking with thresholds
- CPU usage monitoring
- Database query performance
- Response time analysis

### **Business Intelligence**
- Real-time sales tracking
- User activity monitoring
- Listing performance metrics
- Buyback system analytics

### **Alert Generation**
Automated alerts for:
- High memory usage (>500MB warning, >1GB critical)
- Pending buyback offers (>10 warning)
- Low conversion rates (<5% warning)
- High pending payouts (>$10,000 critical)
- System errors and failures

## Integration with Structured Logging

All health checks and metrics are integrated with the structured logging system:

```typescript
// Health check events
{
  "level": "info",
  "time": "2025-01-29T02:52:57.162Z",
  "status": "healthy",
  "responseTime": 23,
  "type": "health_check",
  "msg": "Health check performed"
}

// Metrics collection
{
  "level": "info",
  "time": "2025-01-29T02:52:57.634Z",
  "type": "metrics_collection",
  "requests_total": 158,
  "memory_usage": 89,
  "msg": "System metrics collected"
}

// Business metrics
{
  "level": "info",
  "time": "2025-01-29T02:53:00.000Z",
  "type": "business_metrics",
  "daily_sales": 1250.00,
  "active_users": 189,
  "msg": "Business metrics calculated"
}
```

## Monitoring Best Practices

### **Development Environment**
- Use health checks for troubleshooting
- Monitor memory usage during development
- Track request patterns and performance
- Review business metrics for feature impact

### **Production Environment**
- Set up external monitoring (Uptime Robot, Pingdom)
- Configure alerts for critical thresholds
- Monitor business KPIs regularly
- Set up log aggregation for metrics

### **Container Orchestration**
```yaml
# Kubernetes health check example
livenessProbe:
  httpGet:
    path: /health/live
    port: 5000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 5000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### **Load Balancer Configuration**
```nginx
# Nginx health check
upstream opshop_backend {
    server localhost:5000 max_fails=3 fail_timeout=30s;
}

location /health {
    proxy_pass http://opshop_backend/health;
    proxy_connect_timeout 1s;
    proxy_read_timeout 3s;
}
```

## Monitoring Dashboards

### **Recommended Metrics to Track**
1. **System Health**
   - Response time trends
   - Error rate by endpoint
   - Memory and CPU usage
   - Database query performance

2. **Business KPIs**
   - Daily/weekly/monthly sales
   - User registration and retention
   - Listing conversion rates
   - Buyback offer acceptance rates

3. **Operational Metrics**
   - Request volume and patterns
   - Authentication success rates
   - Payment processing success
   - Email delivery rates

### **Alert Thresholds**
- **Critical**: System down, database unreachable, memory >1GB
- **Warning**: High error rate (>10%), slow responses (>2s), pending actions
- **Info**: Positive trends, milestone achievements, system updates

## API Usage Examples

### **Health Check Monitoring Script**
```bash
#!/bin/bash

# Health check script for monitoring
HEALTH_URL="http://localhost:5000/health"
METRICS_URL="http://localhost:5000/metrics"

# Check overall health
HEALTH_STATUS=$(curl -s $HEALTH_URL | jq -r '.status')

if [ "$HEALTH_STATUS" = "healthy" ]; then
    echo "✅ System healthy"
elif [ "$HEALTH_STATUS" = "degraded" ]; then
    echo "⚠️ System degraded"
    curl -s $HEALTH_URL | jq '.services[] | select(.status != "healthy")'
else
    echo "❌ System unhealthy"
    curl -s $HEALTH_URL | jq '.services'
    exit 1
fi

# Check metrics
ERROR_RATE=$(curl -s $METRICS_URL | jq -r '.requests.error_rate')
if [ "$ERROR_RATE" -gt 10 ]; then
    echo "⚠️ High error rate: ${ERROR_RATE}%"
fi
```

### **Business Metrics Monitoring**
```bash
#!/bin/bash

# Business metrics monitoring
MONITORING_URL="http://localhost:5000/api/admin/monitoring"
TOKEN="your-auth-token"

# Get business metrics (requires authentication)
RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" $MONITORING_URL)

DAILY_SALES=$(echo $RESPONSE | jq -r '.business_metrics.sales.daily')
PENDING_OFFERS=$(echo $RESPONSE | jq -r '.business_metrics.buyback.offers_pending')
CRITICAL_ALERTS=$(echo $RESPONSE | jq -r '.summary.critical_issues')

echo "📊 Daily Sales: $${DAILY_SALES}"
echo "⏳ Pending Buyback Offers: $PENDING_OFFERS"

if [ "$CRITICAL_ALERTS" -gt 0 ]; then
    echo "🚨 Critical alerts: $CRITICAL_ALERTS"
    echo $RESPONSE | jq '.alerts.critical'
fi
```

## Troubleshooting

### **Common Issues**

#### Health Check Returns 503
- Check database connectivity
- Verify environment variables
- Review system resource usage
- Check application logs

#### High Memory Usage
- Monitor heap usage trends
- Look for memory leaks
- Check for large request payloads
- Review database connection pooling

#### High Error Rates
- Check authentication issues
- Review API endpoint logs
- Verify external service connectivity
- Monitor request patterns

### **Performance Optimization**
- Use health check caching for high-traffic scenarios
- Implement circuit breakers for external dependencies
- Set up proper database connection pooling
- Monitor and optimize slow database queries

The comprehensive monitoring system provides full visibility into Opshop Online's health, performance, and business metrics, enabling proactive maintenance and rapid issue resolution.