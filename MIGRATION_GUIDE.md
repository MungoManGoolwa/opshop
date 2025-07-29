# Database Migration Management Guide

## Overview

Opshop Online now includes a comprehensive migration tracking and rollback system built on top of Drizzle ORM. This system provides safe database schema changes with full rollback support and migration tracking.

## Features

### 🔄 **Migration Tracking**
- Tracks all applied migrations in `__migration_tracking` table
- Maintains migration metadata in `drizzle/migration-metadata.json`
- Checksums for migration integrity verification
- Batch numbering for rollback groups

### ⏮️ **Rollback Support**
- Safe rollback of last applied migration
- Rollback history tracking for audit trails
- Prevention of production rollbacks without explicit confirmation
- Automatic schema state management

### 📊 **Status Monitoring**
- Complete migration status overview
- Pending vs applied migration tracking
- Migration timing and history
- Comprehensive reporting dashboard

### 🔒 **Safety Features**
- Production environment protection
- Migration integrity checking
- Automatic backup recommendations
- Detailed logging and error handling

## Commands

### Direct Script Usage

All migration commands can be run directly using the migration script:

```bash
# Generate new migration from schema changes
node scripts/migrate.js generate

# Apply pending migrations
node scripts/migrate.js migrate

# Rollback last migration
node scripts/migrate.js rollback

# Check migration status
node scripts/migrate.js status

# Reset database (development only)
node scripts/migrate.js reset
```

### Alternative Using Existing npm Scripts

You can also use the existing `db:push` command for direct schema updates:

```bash
# Push schema changes directly (use with caution)
npm run db:push
```

## Migration Workflow

### 1. **Development Workflow**

```bash
# 1. Modify your schema in shared/schema.ts
# 2. Generate migration
node scripts/migrate.js generate

# 3. Review generated migration files
# 4. Apply migrations
node scripts/migrate.js migrate

# 5. Check status
node scripts/migrate.js status
```

### 2. **Production Deployment**

```bash
# 1. Backup production database
# 2. Check migration status
node scripts/migrate.js status

# 3. Apply pending migrations
NODE_ENV=production node scripts/migrate.js migrate

# 4. Verify deployment
node scripts/migrate.js status
```

### 3. **Emergency Rollback**

```bash
# 1. Check current status
node scripts/migrate.js status

# 2. Rollback last migration
node scripts/migrate.js rollback

# 3. Verify rollback
node scripts/migrate.js status
```

## Migration Files

### Structure
```
drizzle/
├── migrations/
│   ├── meta/
│   │   ├── _journal.json          # Drizzle migration journal
│   │   └── 0000_snapshot.json     # Schema snapshots
│   ├── 0000_initial_schema.sql    # Migration SQL files
│   └── 0001_add_user_table.sql
├── migration-metadata.json        # Custom tracking metadata
└── README.md                      # Migration documentation
```

### Migration Tracking Table

The system creates a `__migration_tracking` table:

```sql
CREATE TABLE __migration_tracking (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rollback_sql TEXT,
  checksum VARCHAR(64),
  batch_number INTEGER DEFAULT 1
);
```

## Status Reports

### Example Status Output

```
📊 Migration Status Report
================================
Total migration files: 5
Applied migrations: 4
Pending migrations: 1
Last applied: 2025-01-29 14:30:45

📋 Migration Details:
  ✅ Applied 0000_initial_schema.sql 2025-01-29 10:15:23
  ✅ Applied 0001_add_user_table.sql 2025-01-29 10:16:45
  ✅ Applied 0002_add_products.sql 2025-01-29 12:30:12
  ✅ Applied 0003_add_orders.sql 2025-01-29 14:30:45
  ⏳ Pending 0004_add_analytics.sql

🔄 Recent Rollbacks:
  2025-01-29 13:45:20 - 0002_add_products.sql
```

## Integration with Structured Logging

The migration system integrates with the structured logging system:

```typescript
import { dbLogger } from './config/logger';

// Migration events are automatically logged
dbLogger.query('CREATE TABLE users (...)', [], 150);
dbLogger.error(error, 'ALTER TABLE products ADD COLUMN ...');
```

### Log Examples

```json
{
  "level": "info",
  "time": "2025-01-29T02:48:00.000Z",
  "type": "database_migration",
  "migration": "0001_add_user_table.sql",
  "action": "applied",
  "duration": 245,
  "checksum": "a1b2c3d4e5f6",
  "msg": "Migration applied successfully"
}
```

## Safety and Best Practices

### Production Safety

1. **Always Backup First**
   ```bash
   # Backup before migrations
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Test in Staging**
   - Apply migrations in staging environment first
   - Verify application functionality
   - Test rollback procedures

3. **Monitor During Deployment**
   - Watch application logs during migration
   - Monitor database performance metrics
   - Have rollback plan ready

### Development Best Practices

1. **Small, Incremental Changes**
   - Keep migrations focused and small
   - Avoid large data transformations in migrations
   - Use separate data migration scripts for complex changes

2. **Review Before Apply**
   - Always review generated SQL before applying
   - Check for potential data loss operations
   - Verify foreign key constraints

3. **Test Rollbacks**
   - Test rollback procedures in development
   - Ensure rollbacks don't cause data loss
   - Document any manual steps required

## Troubleshooting

### Common Issues

#### "Migration table already exists"
```bash
# Check if migration tracking table exists
psql $DATABASE_URL -c "\dt __migration_tracking"

# If corrupted, reset in development only
node scripts/migrate.js reset
```

#### "Migration file not found"
```bash
# Check migration files exist
ls -la migrations/

# Regenerate if missing
node scripts/migrate.js generate
```

#### "Checksum mismatch"
```bash
# Check migration integrity
node scripts/migrate.js status

# Regenerate migration if needed
rm migrations/0001_*.sql
node scripts/migrate.js generate
```

### Recovery Procedures

#### Corrupted Migration State
```bash
# Development environment
node scripts/migrate.js reset

# Production environment (careful!)
# 1. Backup database
# 2. Manually fix __migration_tracking table
# 3. Re-sync migration state
```

#### Failed Migration
```bash
# Check what failed
node scripts/migrate.js status

# Rollback if possible
node scripts/migrate.js rollback

# Fix schema and regenerate
node scripts/migrate.js generate
```

## Environment-Specific Configuration

### Development
- Full migration tracking enabled
- Rollback allowed without confirmation
- Detailed logging and error reporting
- Database reset functionality available

### Production
- Enhanced safety checks
- Rollback requires explicit confirmation
- Minimal logging to reduce noise
- Database reset disabled
- Automatic backup reminders

## Integration Examples

### Custom Migration Script

```javascript
const { applyMigrations, showStatus } = require('./scripts/migrate.js');

async function deployWithMigrations() {
  try {
    console.log('Starting deployment...');
    
    // Apply pending migrations
    await applyMigrations();
    
    // Verify migration status
    await showStatus();
    
    console.log('Deployment completed successfully');
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Run Database Migrations
  run: |
    node scripts/migrate.js status
    node scripts/migrate.js migrate
    node scripts/migrate.js status
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Monitoring and Alerts

### Key Metrics to Monitor

1. **Migration Success Rate**: Track successful vs failed migrations
2. **Migration Duration**: Monitor performance impact
3. **Rollback Frequency**: Alert on excessive rollbacks
4. **Schema Drift**: Detect unauthorized schema changes

### Alerting Examples

```bash
# Check for failed migrations
if ! node scripts/migrate.js status | grep -q "Pending migrations: 0"; then
  echo "⚠️ Pending migrations detected"
  exit 1
fi

# Check for recent rollbacks
if grep -q "rollback" drizzle/migration-metadata.json; then
  echo "🔄 Recent rollbacks detected"
fi
```

## Future Enhancements

### Planned Features

1. **Migration Branching**: Support for feature branch migrations
2. **Data Migrations**: Separate data transformation workflows
3. **Schema Validation**: Automated schema compliance checking
4. **Performance Analysis**: Migration performance profiling
5. **Team Collaboration**: Migration conflict resolution

### Integration Roadmap

1. **Monitoring Dashboard**: Web UI for migration status
2. **Slack Notifications**: Team alerts for migration events
3. **Automated Testing**: Migration testing in CI/CD
4. **Performance Metrics**: Database impact analysis

The migration system provides enterprise-grade database change management while maintaining simplicity for everyday development workflows.