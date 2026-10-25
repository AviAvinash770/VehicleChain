import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "AUTHORITY" | "OWNER" | "BUYER" | "VERIFIER";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  walletAddress?: string;
  phone?: string;
  department?: string; // For RTO Authority
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["AUTHORITY", "OWNER", "BUYER", "VERIFIER"],
      required: true,
      default: "OWNER",
    },
    walletAddress: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    phone: { type: String, trim: true },
    department: { type: String, trim: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
