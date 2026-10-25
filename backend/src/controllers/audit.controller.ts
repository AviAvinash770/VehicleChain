import { Response } from "express";
import { AuditLog } from "../models/AuditLog";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export class AuditController {
  static async getLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const logs = await AuditLog.find()
        .populate("performedBy", "name email role")
        .sort({ createdAt: -1 })
        .limit(100);

      res.status(200).json({ success: true, total: logs.length, logs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Failed to fetch audit logs", error: err.message });
    }
  }
}
