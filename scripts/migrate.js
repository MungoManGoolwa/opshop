#!/usr/bin/env node

/**
 * Drizzle Migration Management Script
 * Provides migration tracking, rollback, and status checking functionality
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import crypto from 'crypto';
import dotenv from 'dotenv';

const { Pool } = pg;

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

// Database connection
const pool = new Pool({ connectionString: DATABASE_URL });

// Migration metadata storage
const MIGRATION_METADATA_FILE = './drizzle/migration-metadata.json';
const MIGRATIONS_DIR = './migrations';

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📋',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }[type];
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function execCommand(command, description) {
  log(`Executing: ${description}`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return output;
  } catch (error) {
    log(`Failed: ${error.message}`, 'error');
    throw error;
  }
}

// Migration metadata management
function loadMigrationMetadata() {
  if (!fs.existsSync(MIGRATION_METADATA_FILE)) {
    return {
      migrations: [],
      lastApplied: null,
      rollbacks: []
    };
  }
  return JSON.parse(fs.readFileSync(MIGRATION_METADATA_FILE, 'utf8'));
}

function saveMigrationMetadata(metadata) {
  const dir = path.dirname(MIGRATION_METADATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(MIGRATION_METADATA_FILE, JSON.stringify(metadata, null, 2));
}

function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();
}

// Database migration tracking table
async function ensureMigrationTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS __migration_tracking (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      rollback_sql TEXT,
      checksum VARCHAR(64),
      batch_number INTEGER DEFAULT 1
    );
  `;
  
  try {
    await pool.query(query);
    log('Migration tracking table ensured');
  } catch (error) {
    log(`Failed to create migration tracking table: ${error.message}`, 'error');
    throw error;
  }
}

// Get applied migrations from database
async function getAppliedMigrations() {
  try {
    const result = await pool.query(
      'SELECT migration_name, applied_at FROM __migration_tracking ORDER BY applied_at'
    );
    return result.rows;
  } catch (error) {
    // Table might not exist yet
    return [];
  }
}

// Generate checksum for migration file
function generateChecksum(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

// Command implementations
async function generateMigration() {
  log('Generating new migration from schema changes...');
  
  try {
    const output = execCommand('npx drizzle-kit generate', 'Generate migration');
    log('Migration generated successfully', 'success');
    
    // Update metadata
    const metadata = loadMigrationMetadata();
    const migrationFiles = getMigrationFiles();
    const newMigrations = migrationFiles.filter(file => 
      !metadata.migrations.find(m => m.filename === file)
    );
    
    newMigrations.forEach(filename => {
      const filepath = path.join(MIGRATIONS_DIR, filename);
      const content = fs.readFileSync(filepath, 'utf8');
      const checksum = generateChecksum(content);
      
      metadata.migrations.push({
        filename,
        generatedAt: new Date().toISOString(),
        checksum,
        applied: false
      });
    });
    
    saveMigrationMetadata(metadata);
    log(`Added ${newMigrations.length} new migration(s) to tracking`, 'success');
    
    return output;
  } catch (error) {
    log(`Migration generation failed: ${error.message}`, 'error');
    throw error;
  }
}

async function applyMigrations() {
  log('Applying pending migrations...');
  
  await ensureMigrationTable();
  
  try {
    // Get current state
    const appliedMigrations = await getAppliedMigrations();
    const appliedNames = appliedMigrations.map(m => m.migration_name);
    const allMigrationFiles = getMigrationFiles();
    const pendingMigrations = allMigrationFiles.filter(file => !appliedNames.includes(file));
    
    if (pendingMigrations.length === 0) {
      log('No pending migrations to apply', 'success');
      return;
    }
    
    log(`Found ${pendingMigrations.length} pending migration(s)`);
    
    // Apply each pending migration
    for (const migrationFile of pendingMigrations) {
      const filepath = path.join(MIGRATIONS_DIR, migrationFile);
      const content = fs.readFileSync(filepath, 'utf8');
      const checksum = generateChecksum(content);
      
      log(`Applying migration: ${migrationFile}`);
      
      // Execute migration
      await pool.query(content);
      
      // Record in tracking table
      await pool.query(
        'INSERT INTO __migration_tracking (migration_name, checksum) VALUES ($1, $2)',
        [migrationFile, checksum]
      );
      
      log(`✅ Applied: ${migrationFile}`, 'success');
    }
    
    // Update metadata
    const metadata = loadMigrationMetadata();
    metadata.lastApplied = new Date().toISOString();
    saveMigrationMetadata(metadata);
    
    log(`Successfully applied ${pendingMigrations.length} migration(s)`, 'success');
    
  } catch (error) {
    log(`Migration application failed: ${error.message}`, 'error');
    throw error;
  }
}

async function showStatus() {
  log('Checking migration status...');
  
  await ensureMigrationTable();
  
  try {
    const appliedMigrations = await getAppliedMigrations();
    const allMigrationFiles = getMigrationFiles();
    const metadata = loadMigrationMetadata();
    
    console.log('\n📊 Migration Status Report');
    console.log('================================');
    console.log(`Total migration files: ${allMigrationFiles.length}`);
    console.log(`Applied migrations: ${appliedMigrations.length}`);
    console.log(`Pending migrations: ${allMigrationFiles.length - appliedMigrations.length}`);
    
    if (metadata.lastApplied) {
      console.log(`Last applied: ${new Date(metadata.lastApplied).toLocaleString()}`);
    }
    
    console.log('\n📋 Migration Details:');
    allMigrationFiles.forEach(file => {
      const isApplied = appliedMigrations.find(m => m.migration_name === file);
      const status = isApplied ? '✅ Applied' : '⏳ Pending';
      const date = isApplied ? new Date(isApplied.applied_at).toLocaleString() : '';
      console.log(`  ${status} ${file} ${date}`);
    });
    
    if (metadata.rollbacks && metadata.rollbacks.length > 0) {
      console.log('\n🔄 Recent Rollbacks:');
      metadata.rollbacks.slice(-5).forEach(rollback => {
        console.log(`  ${new Date(rollback.timestamp).toLocaleString()} - ${rollback.migration}`);
      });
    }
    
  } catch (error) {
    log(`Status check failed: ${error.message}`, 'error');
    throw error;
  }
}

async function rollbackMigration() {
  log('Rolling back last migration...');
  
  await ensureMigrationTable();
  
  try {
    // Get last applied migration
    const result = await pool.query(
      'SELECT * FROM __migration_tracking ORDER BY applied_at DESC LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      log('No migrations to rollback', 'warning');
      return;
    }
    
    const lastMigration = result.rows[0];
    log(`Rolling back: ${lastMigration.migration_name}`);
    
    // Create rollback from Drizzle
    const rollbackOutput = execCommand('npx drizzle-kit push --force', 'Generate rollback');
    
    // Remove from tracking table
    await pool.query(
      'DELETE FROM __migration_tracking WHERE migration_name = $1',
      [lastMigration.migration_name]
    );
    
    // Update metadata
    const metadata = loadMigrationMetadata();
    metadata.rollbacks = metadata.rollbacks || [];
    metadata.rollbacks.push({
      migration: lastMigration.migration_name,
      timestamp: new Date().toISOString(),
      reason: 'Manual rollback'
    });
    saveMigrationMetadata(metadata);
    
    log(`Successfully rolled back: ${lastMigration.migration_name}`, 'success');
    
  } catch (error) {
    log(`Rollback failed: ${error.message}`, 'error');
    throw error;
  }
}

async function resetDatabase() {
  log('⚠️  Resetting database (development only)...', 'warning');
  
  if (process.env.NODE_ENV === 'production') {
    log('❌ Database reset is not allowed in production!', 'error');
    throw new Error('Database reset blocked in production');
  }
  
  try {
    // Drop all tables and recreate from schema
    const output = execCommand('npx drizzle-kit push --force', 'Reset database');
    
    // Clear migration tracking
    await pool.query('DROP TABLE IF EXISTS __migration_tracking CASCADE');
    
    // Reset metadata
    const metadata = {
      migrations: [],
      lastApplied: null,
      rollbacks: [{
        migration: 'database_reset',
        timestamp: new Date().toISOString(),
        reason: 'Development database reset'
      }]
    };
    saveMigrationMetadata(metadata);
    
    log('Database reset completed', 'success');
    
  } catch (error) {
    log(`Database reset failed: ${error.message}`, 'error');
    throw error;
  }
}

// Command line interface
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'generate':
        await generateMigration();
        break;
      case 'migrate':
      case 'up':
        await applyMigrations();
        break;
      case 'rollback':
      case 'down':
        await rollbackMigration();
        break;
      case 'status':
        await showStatus();
        break;
      case 'reset':
        await resetDatabase();
        break;
      default:
        console.log(`
🗃️  Drizzle Migration Management

Usage: node scripts/migrate.js <command>

Commands:
  generate  Generate new migration from schema changes
  migrate   Apply pending migrations (alias: up)
  rollback  Rollback last migration (alias: down)
  status    Show migration status
  reset     Reset database (development only)

Examples:
  npm run db:generate    # Generate new migration
  npm run db:migrate     # Apply pending migrations
  npm run db:rollback    # Rollback last migration
  npm run db:status      # Check migration status
  npm run db:reset       # Reset database (dev only)
        `);
        break;
    }
  } catch (error) {
    log(`Command failed: ${error.message}`, 'error');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Handle process signals
process.on('SIGINT', async () => {
  log('Received SIGINT, closing database connection...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('Received SIGTERM, closing database connection...');
  await pool.end();
  process.exit(0);
});

// Check if this is the main module
const isMainModule = process.argv[1] === new URL(import.meta.url).pathname;

if (isMainModule) {
  main();
}

export {
  generateMigration,
  applyMigrations,
  rollbackMigration,
  showStatus,
  resetDatabase
};