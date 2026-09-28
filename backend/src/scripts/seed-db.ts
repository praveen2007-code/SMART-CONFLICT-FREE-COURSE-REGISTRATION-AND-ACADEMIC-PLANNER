import { connectDB } from '../config/db';
import { seedMongoDatabase } from './seed-mongo';
import mongoose from 'mongoose';

async function run() {
  try {
    await connectDB();
    await seedMongoDatabase();
    console.log('[Seed DB] MongoDB Seed data inserted successfully!');
  } catch (err: any) {
    console.error('[Seed DB] Error inserting seed data:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
