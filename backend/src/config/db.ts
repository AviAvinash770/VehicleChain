import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { config } from "./env";

let mongoServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<void> {
  let uri = config.mongoUri;

  if (!uri) {
    console.log("No MONGODB_URI provided. Initializing embedded in-memory MongoDB instance...");
    try {
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log(`Embedded MongoDB started at: ${uri}`);
    } catch (err) {
      console.warn("Could not start MongoMemoryServer, falling back to local mongodb://127.0.0.1:27017/vehiclechain", err);
      uri = "mongodb://127.0.0.1:27017/vehiclechain";
    }
  }

  try {
    await mongoose.connect(uri);
    console.log(`Connected to MongoDB successfully at: ${uri}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    // If external URI failed and we haven't tried memory server yet:
    if (!mongoServer) {
      console.log("Attempting to fall back to in-memory MongoDB for local demo...");
      try {
        mongoServer = await MongoMemoryServer.create();
        uri = mongoServer.getUri();
        await mongoose.connect(uri);
        console.log(`Connected to fallback embedded MongoDB at: ${uri}`);
        return;
      } catch (fallbackError) {
        console.error("Embedded MongoDB fallback also failed:", fallbackError);
      }
    }
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}
