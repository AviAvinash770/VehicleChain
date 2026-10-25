import mongoose, { Schema, Document } from "mongoose";

export type VehicleStatus = "ACTIVE" | "SUSPENDED" | "DEREGISTERED";

export interface IVehicle {
  vehicleId: string;
  registrationNumber: string;
  vin: string;
  vinHash: string;
  manufacturer: string;
  model: string;
  year: number;
  vehicleType: string;
  currentOwner: mongoose.Types.ObjectId;
  currentOwnerWallet: string;
  status: VehicleStatus;
  registrationTxHash: string;
  blockNumber?: number;
  initialDocHash: string;
  ipfsDocCID: string;
  qrCodeDataUrl?: string;
  statusChangeReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    vehicleId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    vin: { type: String, required: true, trim: true },
    vinHash: { type: String, required: true, unique: true, lowercase: true, trim: true },
    manufacturer: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    vehicleType: { type: String, required: true, trim: true },
    currentOwner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    currentOwnerWallet: { type: String, required: true, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "DEREGISTERED"],
      default: "ACTIVE",
      required: true,
    },
    registrationTxHash: { type: String, required: true, trim: true },
    blockNumber: { type: Number },
    initialDocHash: { type: String, required: true, lowercase: true, trim: true },
    ipfsDocCID: { type: String, required: true, trim: true },
    qrCodeDataUrl: { type: String },
    statusChangeReason: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Vehicle = mongoose.model<IVehicle>("Vehicle", VehicleSchema);
