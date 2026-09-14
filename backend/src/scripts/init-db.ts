import { pool } from '../config/db';
import fs from 'fs';
import path from 'path';

async function run() {
  const client = await pool.connect();
  try {
    console.log('[Init DB] Reading schema.sql...');
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(sql);
    console.log('[Init DB] Schema executed successfully!');
  } catch (err: any) {
    console.error('[Init DB] Error executing schema:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
