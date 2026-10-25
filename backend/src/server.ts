import { app } from "./app";
import { config } from "./config/env";
import { connectDB } from "./config/db";
import { BlockchainService } from "./services/blockchain.service";
import { seedDatabase } from "./scripts/seed";

async function startServer() {
  try {
    console.log("--------------------------------------------------");
    console.log("Starting VehicleChain Backend Server...");
    console.log(`Environment: ${config.nodeEnv}`);

    // Connect to MongoDB
    await connectDB();

    // Initialize Blockchain connection
    await BlockchainService.init();

    // Auto-seed demo accounts and mock records for quick review
    await seedDatabase();

    app.listen(config.port, () => {
      console.log(`VehicleChain Backend running at: http://localhost:${config.port}`);
      console.log(`Public Health check: http://localhost:${config.port}/api/health`);
      console.log("--------------------------------------------------");
    });
  } catch (error) {
    console.error("Fatal error starting server:", error);
    process.exit(1);
  }
}

startServer();
