import { Response } from "express";
import { Notification } from "../models/Notification";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export class NotificationController {
  static async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userWallet = req.user?.walletAddress?.toLowerCase();
      const notifications = await Notification.find({
        $or: [
          { recipient: req.user!._id },
          ...(userWallet ? [{ recipientWallet: userWallet }] : []),
        ],
      })
        .sort({ createdAt: -1 })
        .limit(50);

      const unreadCount = await Notification.countDocuments({
        $or: [
          { recipient: req.user!._id },
          ...(userWallet ? [{ recipientWallet: userWallet }] : []),
        ],
        read: false,
      });

      res.status(200).json({ success: true, unreadCount, notifications });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Failed to fetch notifications", error: err.message });
    }
  }

  static async markRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await Notification.findByIdAndUpdate(id, { read: true });
      res.status(200).json({ success: true, message: "Notification marked as read" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Failed to update notification", error: err.message });
    }
  }

  static async markAllRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userWallet = req.user?.walletAddress?.toLowerCase();
      await Notification.updateMany(
        {
          $or: [
            { recipient: req.user!._id },
            ...(userWallet ? [{ recipientWallet: userWallet }] : []),
          ],
          read: false,
        },
        { read: true }
      );
      res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Failed to mark all as read", error: err.message });
    }
  }
}
