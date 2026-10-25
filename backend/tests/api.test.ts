import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { connectDB, disconnectDB } from "../src/config/db";
import { User } from "../src/models/User";
import { Vehicle } from "../src/models/Vehicle";

describe("VehicleChain Backend API Tests", () => {
  let authorityToken: string;
  let ownerToken: string;
  let buyerToken: string;

  beforeAll(async () => {
    await connectDB();
  }, 60000);

  afterAll(async () => {
    await disconnectDB();
  });

  describe("1. Authentication & RBAC", () => {
    it("Should register a new authority user", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "RTO Officer In-Charge",
          email: "rto_test@vehiclechain.gov.in",
          password: "SecurePassword123!",
          role: "AUTHORITY",
          walletAddress: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe("AUTHORITY");
      authorityToken = res.body.token;
    });

    it("Should register a vehicle owner user", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test Seller Malhotra",
          email: "seller_test@vehiclechain.gov.in",
          password: "SecurePassword123!",
          role: "OWNER",
          walletAddress: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        });

      expect(res.status).toBe(201);
      ownerToken = res.body.token;
    });

    it("Should register a buyer user", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test Buyer Verma",
          email: "buyer_test@vehiclechain.gov.in",
          password: "SecurePassword123!",
          role: "BUYER",
          walletAddress: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
        });

      expect(res.status).toBe(201);
      buyerToken = res.body.token;
    });

    it("Should reject duplicate email registration", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Duplicate User",
          email: "rto_test@vehiclechain.gov.in",
          password: "SecurePassword123!",
          role: "OWNER",
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("Should login successfully with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "rto_test@vehiclechain.gov.in",
          password: "SecurePassword123!",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it("Should reject login with invalid password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "rto_test@vehiclechain.gov.in",
          password: "WrongPassword999",
        });

      expect(res.status).toBe(401);
    });
  });

  describe("2. Vehicle Management & Registration", () => {
    it("Should allow Authority to register a vehicle with simulated RC document", async () => {
      const res = await request(app)
        .post("/api/vehicles/register")
        .set("Authorization", `Bearer ${authorityToken}`)
        .field("vehicleId", "VEH-TEST-001")
        .field("registrationNumber", "DL 01 AB 1234")
        .field("vin", "TESTVIN9876543210")
        .field("manufacturer", "Mahindra")
        .field("model", "XUV700 AX7L")
        .field("year", 2024)
        .field("vehicleType", "SUV")
        .field("initialOwnerWallet", "0x70997970c51812dc3a010c7d01b50e0d17dc79c8")
        .attach("document", Buffer.from("REGISTRATION_CERTIFICATE_CONTENT_DL01AB1234"), "RC.pdf");

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.vehicle.vehicleId).toBe("VEH-TEST-001");
      expect(res.body.vehicle.initialDocHash).toBeDefined();
      expect(res.body.vehicle.qrCodeDataUrl).toContain("data:image/png;base64");
    });

    it("Should reject non-authority attempting to register vehicle", async () => {
      const res = await request(app)
        .post("/api/vehicles/register")
        .set("Authorization", `Bearer ${ownerToken}`)
        .field("vehicleId", "VEH-TEST-002")
        .field("registrationNumber", "DL 01 AB 5678")
        .field("vin", "TESTVIN9999999999")
        .field("manufacturer", "Mahindra")
        .field("model", "Scorpio-N")
        .field("year", 2024)
        .field("vehicleType", "SUV")
        .field("initialOwnerWallet", "0x70997970c51812dc3a010c7d01b50e0d17dc79c8");

      expect(res.status).toBe(403);
    });

    it("Should reject duplicate vehicle registration", async () => {
      const res = await request(app)
        .post("/api/vehicles/register")
        .set("Authorization", `Bearer ${authorityToken}`)
        .field("vehicleId", "VEH-TEST-001")
        .field("registrationNumber", "DL 01 AB 1234")
        .field("vin", "TESTVIN9876543210")
        .field("manufacturer", "Mahindra")
        .field("model", "XUV700 AX7L")
        .field("year", 2024)
        .field("vehicleType", "SUV")
        .field("initialOwnerWallet", "0x70997970c51812dc3a010c7d01b50e0d17dc79c8");

      expect(res.status).toBe(409);
    });
  });

  describe("3. Document Integrity Verification", () => {
    it("Should confirm document integrity when identical file is verified", async () => {
      const res = await request(app)
        .post("/api/vehicles/VEH-TEST-001/verify-document")
        .set("Authorization", `Bearer ${authorityToken}`)
        .attach("document", Buffer.from("REGISTRATION_CERTIFICATE_CONTENT_DL01AB1234"), "RC.pdf");

      expect(res.status).toBe(200);
      expect(res.body.verified).toBe(true);
    });

    it("Should report document mismatch when modified file is uploaded", async () => {
      const res = await request(app)
        .post("/api/vehicles/VEH-TEST-001/verify-document")
        .set("Authorization", `Bearer ${authorityToken}`)
        .attach("document", Buffer.from("TAMPERED_FORGED_DOCUMENT_CONTENT"), "RC_fake.pdf");

      expect(res.status).toBe(200);
      expect(res.body.verified).toBe(false);
      expect(res.body.message).toContain("MISMATCH");
    });
  });

  describe("4. Public Verification & Privacy Protection", () => {
    it("Should allow public query and return masked owner information without private data", async () => {
      const res = await request(app).get("/api/public/verify/DL 01 AB 1234");

      expect(res.status).toBe(200);
      expect(res.body.verified).toBe(true);
      expect(res.body.data.registrationNumber).toBe("DL 01 AB 1234");
      // Masked wallet address should be format 0x1234...5678
      expect(res.body.data.currentOwnerMasked).toMatch(/^0x[a-f0-9]{4}\.\.\.[a-f0-9]{4}$/i);
      // No confidential email, password, or phone in public verification payload
      expect(res.body.data.email).toBeUndefined();
      expect(res.body.data.password).toBeUndefined();
      expect(res.body.data.phone).toBeUndefined();
    });

    it("Should return 404 for unknown vehicle queries", async () => {
      const res = await request(app).get("/api/public/verify/UNKNOWN-VEHICLE-999");
      expect(res.status).toBe(404);
      expect(res.body.verified).toBe(false);
    });
  });
});
