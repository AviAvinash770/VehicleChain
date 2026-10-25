import mongoose, { Schema, Document } from "mongoose";

export type DocType = "REGISTRATION" | "TRANSFER_AGREEMENT" | "INSURANCE" | "PUC" | "IDENTITY";

export interface IDocumentMetadata extends Document {
  documentId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  sha256Hash: string;
  ipfsCID: string;
  uploadedBy: mongoose.Types.ObjectId;
  vehicleId?: string;
  docType: DocType;
  createdAt: Date;
}

const DocumentMetadataSchema = new Schema<IDocumentMetadata>(
  {
    documentId: { type: String, required: true, unique: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    sha256Hash: { type: String, required: true, lowercase: true, index: true },
    ipfsCID: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vehicleId: { type: String, uppercase: true, index: true },
    docType: {
      type: String,
      enum: ["REGISTRATION", "TRANSFER_AGREEMENT", "INSURANCE", "PUC", "IDENTITY"],
      required: true,
    },
  },
  { timestamps: true }
);

export const DocumentMetadata = mongoose.model<IDocumentMetadata>(
  "DocumentMetadata",
  DocumentMetadataSchema
);
