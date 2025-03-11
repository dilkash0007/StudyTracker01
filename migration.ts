#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from './shared/schema';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

async function main() {
  console.log('Creating database pool...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool, schema });

  console.log('Starting migration...');
  try {
    // Create tables directly from the schema
    const tables = Object.values(schema)
      .filter(value => typeof value === 'object' && value !== null && 'name' in value)
      .map(table => (table as any).name);
    
    console.log(`Found tables: ${tables.join(', ')}`);

    // Push the schema to the database
    console.log('Pushing schema to database...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        display_name TEXT,
        email TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date TIMESTAMP,
        priority TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'pending',
        subject TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS study_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        duration INTEGER NOT NULL,
        date TIMESTAMP NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        subject TEXT,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS settings (
        user_id INTEGER PRIMARY KEY,
        theme TEXT DEFAULT 'light',
        accent_color TEXT DEFAULT '#007AFF',
        show_animations BOOLEAN DEFAULT TRUE,
        show_task_due_times BOOLEAN DEFAULT TRUE,
        font_size TEXT DEFAULT 'medium',
        notification_settings JSONB DEFAULT '{"studyReminders": true, "taskDeadlines": true, "progressUpdates": true, "soundAlerts": false, "notificationTime": "15 minutes before"}'
      );
    `);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();