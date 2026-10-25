import { Notification, NotificationType } from "../models/Notification";
import mongoose from "mongoose";

export class NotificationService {
  static async send(params: {
    recipient: mongoose.Types.ObjectId | string;
    recipientWallet?: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
    vehicleId?: string;
  }) {
    try {
      return await Notification.create({
        recipient: params.recipient,
        recipientWallet: params.recipientWallet,
        title: params.title,
        message: params.message,
        type: params.type,
        link: params.link,
        vehicleId: params.vehicleId,
      });
    } catch (err: any) {
      console.warn("Failed to create in-app notification:", err.message);
      return null;
    }
  }
}
