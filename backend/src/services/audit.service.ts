import { AuditLog } from "../models/AuditLog";
import mongoose from "mongoose";

export class AuditService {
  static async log(params: {
    action: string;
    performedBy?: mongoose.Types.ObjectId | string;
    performedByRole?: string;
    performedByWallet?: string;
    entityType: string;
    entityId: string;
    details?: Record<string, any>;
    ipAddress?: string;
    txHash?: string;
  }) {
    try {
      return await AuditLog.create({
        action: params.action,
        performedBy: params.performedBy,
        performedByRole: params.performedByRole,
        performedByWallet: params.performedByWallet,
        entityType: params.entityType,
        entityId: params.entityId,
        details: params.details,
        ipAddress: params.ipAddress,
        txHash: params.txHash,
      });
    } catch (err: any) {
      console.warn("Failed to write audit log:", err.message);
      return null;
    }
  }
}
