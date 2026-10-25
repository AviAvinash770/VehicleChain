import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/User";
import { Vehicle } from "../models/Vehicle";
import { DocumentMetadata } from "../models/DocumentMetadata";
import { QrService } from "../services/qr.service";

export async function seedDatabase(): Promise<void> {
  const existingCount = await User.countDocuments();
  if (existingCount > 0) {
    console.log("Database already has records. Skipping initial seeding.");
    return;
  }

  console.log("Seeding demo accounts and initial vehicle record...");

  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash("Password@123", salt);

  // 1. Create Authority
  const authority = await User.create({
    name: "Dr. R. Sharma (Regional Transport Officer)",
    email: "authority@vehiclechain.gov.in",
    passwordHash: commonPasswordHash,
    role: "AUTHORITY",
    walletAddress: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266".toLowerCase(), // Hardhat #0
    department: "RTO Central Division, New Delhi",
    phone: "+91 98765 43210",
  });

  // 2. Create Owner (Seller)
  const owner = await User.create({
    name: "Vikram Malhotra",
    email: "owner@vehiclechain.gov.in",
    passwordHash: commonPasswordHash,
    role: "OWNER",
    walletAddress: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8".toLowerCase(), // Hardhat #1
    phone: "+91 98123 45678",
  });

  // 3. Create Buyer
  const buyer = await User.create({
    name: "Pooja Verma",
    email: "buyer@vehiclechain.gov.in",
    passwordHash: commonPasswordHash,
    role: "BUYER",
    walletAddress: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc".toLowerCase(), // Hardhat #2
    phone: "+91 98456 78901",
  });

  // 4. Create Verifier
  await User.create({
    name: "National Insurance & Traffic Verifier",
    email: "verifier@vehiclechain.gov.in",
    passwordHash: commonPasswordHash,
    role: "VERIFIER",
    walletAddress: "0x90f79bf6eb2c4f870365e785982e1f101e93b906".toLowerCase(), // Hardhat #3
    phone: "+91 99999 00000",
  });

  // 5. Seed Fictional Vehicle: AP 39 AB 2026
  const vehicleId = "VEH-2026-000001";
  const registrationNumber = "AP 39 AB 2026";
  const vin = "MA3EFA123RK876543";
  const vinHash = crypto.createHash("sha256").update(vin).digest("hex");
  const initialDocHash = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
  const ipfsDocCID = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
  const qrCodeDataUrl = await QrService.generateVerificationQr(vehicleId);

  await Vehicle.create({
    vehicleId,
    registrationNumber,
    vin,
    vinHash,
    manufacturer: "Tata Motors",
    model: "Nexon EV Empowered Plus",
    year: 2024,
    vehicleType: "Electric Compact SUV",
    currentOwner: owner._id,
    currentOwnerWallet: owner.walletAddress,
    status: "ACTIVE",
    registrationTxHash: "0x4f87ba6f29da2881bcf7041c2c2f42a5cb8842c8d76e42b26b3e70d4ab5c0101",
    blockNumber: 101,
    initialDocHash,
    ipfsDocCID,
    qrCodeDataUrl,
  });

  await DocumentMetadata.create({
    documentId: `DOC-${Date.now()}`,
    originalName: "RC_Certificate_AP39AB2026.pdf",
    mimeType: "application/pdf",
    sizeBytes: 245760,
    sha256Hash: initialDocHash,
    ipfsCID: ipfsDocCID,
    uploadedBy: authority._id,
    vehicleId,
    docType: "REGISTRATION",
  });

  console.log("Seeding completed successfully!");
  console.log("Demo Credentials:");
  console.log("Authority: authority@vehiclechain.gov.in / Password@123");
  console.log("Owner:     owner@vehiclechain.gov.in     / Password@123");
  console.log("Buyer:     buyer@vehiclechain.gov.in     / Password@123");
  console.log("Verifier:  verifier@vehiclechain.gov.in  / Password@123");
}
