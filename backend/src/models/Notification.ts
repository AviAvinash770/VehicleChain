import mongoose, { Schema, Document } from "mongoose";

export type NotificationType =
  | "TRANSFER_INITIATED"
  | "TRANSFER_ACCEPTED"
  | "TRANSFER_REJECTED"
  | "TRANSFER_APPROVED"
  | "STATUS_CHANGED"
  | "VEHICLE_REGISTERED";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  recipientWallet?: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  vehicleId?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipientWallet: { type: String, lowercase: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "TRANSFER_INITIATED",
        "TRANSFER_ACCEPTED",
        "TRANSFER_REJECTED",
        "TRANSFER_APPROVED",
        "STATUS_CHANGED",
        "VEHICLE_REGISTERED",
      ],
      required: true,
    },
    read: { type: Boolean, default: false },
    link: { type: String },
    vehicleId: { type: String },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
