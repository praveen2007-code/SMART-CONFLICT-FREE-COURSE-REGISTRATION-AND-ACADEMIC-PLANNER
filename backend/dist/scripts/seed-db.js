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
        await (0, db_1.connectDB)();
        await (0, seed_mongo_1.seedMongoDatabase)();
        console.log('[Seed DB] MongoDB Seed data inserted successfully!');
    }
    catch (err) {
        console.error('[Seed DB] Error inserting seed data:', err.message);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
}
run();
