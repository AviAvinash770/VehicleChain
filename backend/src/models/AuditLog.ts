import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  action: string;
  performedBy?: mongoose.Types.ObjectId;
  performedByRole?: string;
  performedByWallet?: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  txHash?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
    performedByRole: { type: String },
    performedByWallet: { type: String, lowercase: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    txHash: { type: String },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
