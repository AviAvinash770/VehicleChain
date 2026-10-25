import mongoose, { Schema, Document } from "mongoose";

export type TransferStatus =
  | "PENDING_BUYER"
  | "PENDING_AUTHORITY"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export interface ITransferRequest extends Document {
  onChainRequestId?: number;
  vehicle: mongoose.Types.ObjectId;
  vehicleId: string;
  registrationNumber: string;
  currentOwner: mongoose.Types.ObjectId;
  currentOwnerWallet: string;
  buyer: mongoose.Types.ObjectId;
  buyerWallet: string;
  buyerName?: string;
  buyerEmail?: string;
  status: TransferStatus;
  transferDocHash: string;
  ipfsDocCID: string;
  rejectionReason?: string;
  initiateTxHash?: string;
  buyerTxHash?: string;
  authorityTxHash?: string;
  salePrice?: number;
  agreementDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransferRequestSchema = new Schema<ITransferRequest>(
  {
    onChainRequestId: { type: Number, index: true },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    vehicleId: { type: String, required: true, uppercase: true, trim: true },
    registrationNumber: { type: String, required: true, uppercase: true, trim: true },
    currentOwner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    currentOwnerWallet: { type: String, required: true, lowercase: true, trim: true },
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    buyerWallet: { type: String, required: true, lowercase: true, trim: true },
    buyerName: { type: String, trim: true },
    buyerEmail: { type: String, lowercase: true, trim: true },
    status: {
      type: String,
      enum: [
        "PENDING_BUYER",
        "PENDING_AUTHORITY",
        "APPROVED",
        "REJECTED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING_BUYER",
      required: true,
    },
    transferDocHash: { type: String, required: true, lowercase: true, trim: true },
    ipfsDocCID: { type: String, required: true, trim: true },
    rejectionReason: { type: String, trim: true },
    initiateTxHash: { type: String, trim: true },
    buyerTxHash: { type: String, trim: true },
    authorityTxHash: { type: String, trim: true },
    salePrice: { type: Number },
    agreementDate: { type: Date },
  },
  { timestamps: true }
);

export const TransferRequest = mongoose.model<ITransferRequest>(
  "TransferRequest",
  TransferRequestSchema
);
