import { pool } from '../config/db';
import fs from 'fs';
import path from 'path';

async function run() {
  const client = await pool.connect();
  try {
    console.log('[Seed DB] Reading seed.sql...');
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');
    const sql = fs.readFileSync(seedPath, 'utf8');
    await client.query(sql);
    console.log('[Seed DB] Seed data inserted successfully!');
  } catch (err: any) {
    console.error('[Seed DB] Error inserting seed data:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
