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
      serverSelectionTimeoutMS: 10000 // 10 seconds for cloud connections
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB database successfully.');
  } catch (err: any) {
    console.warn(`⚠️ Could not connect to external MongoDB (${err.message}).`);

    // Skip in-memory server on Vercel (serverless environment)
    if (process.env.VERCEL) {
      console.error('❌ Cannot use mongodb-memory-server on Vercel. Check MONGODB_URI env variable.');
      throw new Error('MongoDB Atlas connection failed on Vercel: ' + err.message);
    }

    console.log('🚀 Initializing zero-config in-memory MongoDB server (mongodb-memory-server)...');

    try {
      const path = await import('path');
      const fs = await import('fs');
      const dataDir = path.resolve(__dirname, '../../../database/mongo-data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: {
          dbPath: dataDir,
          storageEngine: 'wiredTiger'
        }
      });
      const inMemoryUri = mongod.getUri();

      await mongoose.connect(inMemoryUri);
      isConnected = true;
      console.log(`✅ Persistent MongoDB running and connected (data stored at: ${dataDir})`);
    } catch (memErr: any) {
      console.error('❌ Failed to start persistent MongoDB:', memErr.message);
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
