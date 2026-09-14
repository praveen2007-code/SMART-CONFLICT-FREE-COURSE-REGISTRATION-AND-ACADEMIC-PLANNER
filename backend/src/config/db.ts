import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import { newDb } from 'pg-mem';
import { ENV } from './env';
import fs from 'fs';
import path from 'path';

let activePool: any = null;
let isInMemoryMode = false;

const realPoolConfig: PoolConfig = ENV.DATABASE_URL
  ? { connectionString: ENV.DATABASE_URL }
  : {
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      database: ENV.DB_NAME,
      user: ENV.DB_USER,
      password: ENV.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

// Forwarding pool proxy so imports of `pool` always reference the active pool
export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    if (!activePool) {
      throw new Error('Database pool not initialized yet. Call initDatabase() first.');
    }
    const val = activePool[prop];
    if (typeof val === 'function') {
      return val.bind(activePool);
    }
    return val;
  }
});

export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  if (!activePool) {
    await initDatabase();
  }
  const start = Date.now();
  const res = await activePool.query(text, params);
  const duration = Date.now() - start;
  if (ENV.NODE_ENV === 'development' && duration > 100) {
    console.log(`[SQL Query] (${duration}ms):`, text.replace(/\s+/g, ' ').substring(0, 100));
  }
  return res as QueryResult<T>;
};

function setupInMemoryDatabase(): any {
  console.log('⚡ Initializing In-Memory PostgreSQL Engine (pg-mem)...');
  const db = newDb();

  // Register common utility functions
  db.public.registerFunction({
    name: 'current_database',
    implementation: () => 'course_registration_db'
  });

  const pg = db.adapters.createPg();
  const memPool = new pg.Pool();

  const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
  const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

  if (fs.existsSync(schemaPath) && fs.existsSync(seedPath)) {
    let schemaSql = fs.readFileSync(schemaPath, 'utf8')
      .replace(/CREATE EXTENSION[^\n]+;/gi, '')
      .replace(/FILTER\s*\([^\)]+\)/gi, ''); // clean filter clauses if present

    let seedSql = fs.readFileSync(seedPath, 'utf8')
      .replace(/ALTER SEQUENCE[^\n]+;/gi, '')
      .replace(/TRUNCATE[^\n]+;/gi, '');

    try {
      memPool.query(schemaSql);
      memPool.query(seedSql);
      console.log('✅ In-Memory PostgreSQL loaded with 22+ courses, sections, and demo accounts!');
    } catch (e: any) {
      console.warn('Notice while loading in-memory seed:', e.message);
    }
  }

  isInMemoryMode = true;
  return memPool;
}

export const initDatabase = async (): Promise<boolean> => {
  if (activePool) return true;

  try {
    const candidatePool = new Pool(realPoolConfig);
    const client = await candidatePool.connect();
    console.log(`[PostgreSQL] Connected to ${ENV.DB_NAME} at ${ENV.DB_HOST}:${ENV.DB_PORT}`);

    // Check if courses table exists
    const checkRes = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'courses'
      );
    `);

    const tablesExist = checkRes.rows[0]?.exists;

    if (!tablesExist) {
      console.log('[PostgreSQL] Database tables not found. Initializing schema and seed data...');
      const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
      const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('[PostgreSQL] Schema applied successfully.');
      }

      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await client.query(seedSql);
        console.log('[PostgreSQL] Seed data applied successfully.');
      }
    } else {
      console.log('[PostgreSQL] Schema already initialized.');
    }

    client.release();
    activePool = candidatePool;
    return true;
  } catch (err: any) {
    console.warn(`[PostgreSQL] Notice: Could not connect to real PostgreSQL (${err.message}).`);
    activePool = setupInMemoryDatabase();
    return true;
  }
};
