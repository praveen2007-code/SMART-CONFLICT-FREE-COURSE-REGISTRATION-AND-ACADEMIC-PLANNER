"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = void 0;
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const seed_mongo_1 = require("../scripts/seed-mongo");
let isConnected = false;
async function connectDB() {
    if (isConnected)
        return;
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/course_registration';
    try {
        console.log(`🔌 Attempting to connect to MongoDB at: ${mongoUri}`);
        await mongoose_1.default.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000 // 10 seconds for cloud connections
        });
        isConnected = true;
        console.log('✅ Connected to MongoDB database successfully.');
    }
    catch (err) {
        console.warn(`⚠️ Could not connect to external MongoDB (${err.message}).`);
        // Skip in-memory server on Vercel (serverless environment)
        if (process.env.VERCEL) {
            console.error('❌ Cannot use mongodb-memory-server on Vercel. Check MONGODB_URI env variable.');
            throw new Error('MongoDB Atlas connection failed on Vercel: ' + err.message);
        }
        console.log('🚀 Initializing zero-config in-memory MongoDB server (mongodb-memory-server)...');
        try {
            const path = await Promise.resolve().then(() => __importStar(require('path')));
            const fs = await Promise.resolve().then(() => __importStar(require('fs')));
            const dataDir = path.resolve(__dirname, '../../../database/mongo-data');
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            const { MongoMemoryServer } = await Promise.resolve().then(() => __importStar(require('mongodb-memory-server')));
            const mongod = await MongoMemoryServer.create({
                instance: {
                    dbPath: dataDir,
                    storageEngine: 'wiredTiger'
                }
            });
            const inMemoryUri = mongod.getUri();
            await mongoose_1.default.connect(inMemoryUri);
            isConnected = true;
            console.log(`✅ Persistent MongoDB running and connected (data stored at: ${dataDir})`);
        }
        catch (memErr) {
            console.error('❌ Failed to start persistent MongoDB:', memErr.message);
            throw memErr;
        }
    }
    // Check if database needs initial seeding
    try {
        const userCount = await User_1.User.countDocuments();
        if (userCount === 0) {
            console.log('📦 Database is fresh. Executing automatic initial data seeding...');
            await (0, seed_mongo_1.seedMongoDatabase)();
        }
        else {
            console.log(`📊 Found ${userCount} existing users in MongoDB.`);
        }
    }
    catch (seedErr) {
        console.error('⚠️ Seeding check error:', seedErr.message);
    }
}
const initDatabase = async () => {
    try {
        await connectDB();
        return true;
    }
    catch (err) {
        return false;
    }
};
exports.initDatabase = initDatabase;
exports.default = mongoose_1.default;
