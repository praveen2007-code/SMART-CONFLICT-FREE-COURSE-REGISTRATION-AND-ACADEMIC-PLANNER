import { connectDB } from '../config/db';
import { seedMongoDatabase } from './seed-mongo';
import mongoose from 'mongoose';

async function run() {
  try {
    console.log('[Init DB] Connecting to MongoDB...');
    await connectDB();
    await seedMongoDatabase();
    console.log('[Init DB] MongoDB initialized and seeded successfully!');
  } catch (err: any) {
    console.error('[Init DB] Error initializing database:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
