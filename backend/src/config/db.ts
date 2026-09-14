import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import { ENV } from './env';
import fs from 'fs';
import path from 'path';

const poolConfig: PoolConfig = ENV.DATABASE_URL
  ? { connectionString: ENV.DATABASE_URL }
  : {
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      database: ENV.DB_NAME,
      user: ENV.DB_USER,
      password: ENV.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[PostgreSQL] Unexpected pool client error:', err.message);
});

export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (ENV.NODE_ENV === 'development' && duration > 100) {
    console.log(`[SQL Query] (${duration}ms):`, text.replace(/\s+/g, ' ').substring(0, 100));
  }
  return res;
};

// Check connection & auto-initialize tables if empty
export const initDatabase = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
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
    return true;
  } catch (err: any) {
    console.warn('[PostgreSQL] Database connection warning:', err.message);
    console.warn('[PostgreSQL] Ensure PostgreSQL service is running or start with Docker Compose.');
    return false;
  }
};
