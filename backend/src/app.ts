import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config/env";
import authRoutes from "./routes/auth.routes";
import vehicleRoutes from "./routes/vehicle.routes";
import transferRoutes from "./routes/transfer.routes";
import publicRoutes from "./routes/public.routes";
import notificationRoutes from "./routes/notification.routes";
import auditRoutes from "./routes/audit.routes";
import { errorHandler } from "./middleware/errorHandler.middleware";

export const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or localhost/clientUrl
      if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1") || origin === config.clientUrl) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for academic project demonstration
      }
    },
    credentials: true,
  })
);

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Generous for demo and testing
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsers
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "VehicleChain API",
    timestamp: new Date().toISOString(),
    network: "Hardhat / Sepolia EVM",
  });
});

// Application Routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit", auditRoutes);

// Error Handling
app.use(errorHandler);
