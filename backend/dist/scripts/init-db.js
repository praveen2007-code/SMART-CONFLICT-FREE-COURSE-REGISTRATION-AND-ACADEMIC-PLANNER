"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const seed_mongo_1 = require("./seed-mongo");
const mongoose_1 = __importDefault(require("mongoose"));
async function run() {
    try {
        console.log('[Init DB] Connecting to MongoDB...');
        await (0, db_1.connectDB)();
        await (0, seed_mongo_1.seedMongoDatabase)();
        console.log('[Init DB] MongoDB initialized and seeded successfully!');
    }
    catch (err) {
        console.error('[Init DB] Error initializing database:', err.message);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
}
run();
