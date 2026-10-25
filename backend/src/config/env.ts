import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "super_secret_vehiclechain_jwt_key_academic_demo_2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  rpcUrl: process.env.RPC_URL || "http://127.0.0.1:8545",
  contractAddress: process.env.CONTRACT_ADDRESS || "",
  authorityPrivateKey:
    process.env.AUTHORITY_PRIVATE_KEY ||
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Hardhat Account #0
  pinataApiKey: process.env.PINATA_API_KEY || "",
  pinataSecretKey: process.env.PINATA_SECRET_KEY || "",
  pinataJwt: process.env.PINATA_JWT || "",
  ipfsGateway: process.env.IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/",
};
