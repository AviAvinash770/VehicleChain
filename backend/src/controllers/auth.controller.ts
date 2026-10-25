import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import { config } from "../config/env";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AuditService } from "../services/audit.service";

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role, walletAddress, phone, department } = req.body;

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(409).json({ success: false, message: "Email already registered" });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: role || "OWNER",
        walletAddress: walletAddress ? walletAddress.toLowerCase() : undefined,
        phone,
        department,
      });

      const token = jwt.sign(
        { userId: user._id, role: user.role, email: user.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
      );

      await AuditService.log({
        action: "USER_REGISTERED",
        performedBy: user._id.toString(),
        performedByRole: user.role,
        performedByWallet: user.walletAddress,
        entityType: "User",
        entityId: user._id.toString(),
        details: { email: user.email, role: user.role },
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletAddress: user.walletAddress,
          phone: user.phone,
          department: user.department,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Registration failed", error: err.message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        res.status(401).json({ success: false, message: "Invalid email or password" });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: "Invalid email or password" });
        return;
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role, email: user.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
      );

      await AuditService.log({
        action: "USER_LOGIN",
        performedBy: user._id.toString(),
        performedByRole: user.role,
        performedByWallet: user.walletAddress,
        entityType: "User",
        entityId: user._id.toString(),
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletAddress: user.walletAddress,
          phone: user.phone,
          department: user.department,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Login failed", error: err.message });
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        walletAddress: req.user.walletAddress,
        phone: req.user.phone,
        department: req.user.department,
      },
    });
  }

  static async linkWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const { walletAddress } = req.body;
      const lowerWallet = walletAddress.toLowerCase();

      req.user.walletAddress = lowerWallet;
      await req.user.save();

      await AuditService.log({
        action: "WALLET_LINKED",
        performedBy: req.user._id.toString(),
        performedByRole: req.user.role,
        performedByWallet: lowerWallet,
        entityType: "User",
        entityId: req.user._id.toString(),
        details: { walletAddress: lowerWallet },
      });

      res.status(200).json({
        success: true,
        message: "Wallet linked successfully",
        walletAddress: lowerWallet,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Failed to link wallet", error: err.message });
    }
  }
}
