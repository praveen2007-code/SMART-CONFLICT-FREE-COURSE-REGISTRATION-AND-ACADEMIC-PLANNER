import mongoose from 'mongoose';
import { User } from '../models/User';
import { seedMongoDatabase } from '../scripts/seed-mongo';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/course_registration';

  try {
    console.log(`🔌 Attempting to connect to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500 // Fail fast if no local/remote Mongo server
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB database successfully.');
  } catch (err: any) {
    console.warn(`⚠️ Could not connect to external MongoDB (${err.message}).`);
    console.log('🚀 Initializing zero-config in-memory MongoDB server (mongodb-memory-server)...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();

      await mongoose.connect(inMemoryUri);
      isConnected = true;
      console.log(`✅ In-Memory MongoDB running and connected at: ${inMemoryUri}`);
    } catch (memErr: any) {
      console.error('❌ Failed to start in-memory MongoDB:', memErr.message);
      throw memErr;
    }
  }

  // Check if database needs initial seeding
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('📦 Database is fresh. Executing automatic initial data seeding...');
      await seedMongoDatabase();
    } else {
      console.log(`📊 Found ${userCount} existing users in MongoDB.`);
    }
  } catch (seedErr: any) {
    console.error('⚠️ Seeding check error:', seedErr.message);
  }
}

export const initDatabase = async (): Promise<boolean> => {
  try {
    await connectDB();
    return true;
  } catch (err) {
    return false;
  }
};

export default mongoose;
