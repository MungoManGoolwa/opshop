# Database Migrations

This directory contains Drizzle ORM migration files for Opshop Online database schema management.

## Migration Files

Migrations are automatically generated when you run `npm run db:generate` and applied with `npm run db:migrate`.

## File Structure

- `meta/` - Migration metadata and snapshots
- `YYYYMMDD_HHMMSS_migration_name.sql` - Individual migration files
- `meta/_journal.json` - Migration journal tracking applied migrations

## Commands

- `npm run db:generate` - Generate new migration from schema changes
- `npm run db:migrate` - Apply pending migrations
- `npm run db:rollback` - Rollback last migration
- `npm run db:reset` - Reset database (development only)
- `npm run db:status` - Check migration status

## Safety Notes

- Always backup production database before migrations
- Test migrations in development environment first
- Migrations are tracked in the database `__drizzle_migrations` table
- Rollbacks should be used carefully in production