import { Request, Response } from "express";
import { Vehicle } from "../models/Vehicle";
import { TransferRequest } from "../models/TransferRequest";
import { BlockchainService } from "../services/blockchain.service";
import { StorageService } from "../services/storage.service";

export class PublicController {
  static async verifyVehicle(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.params;
      const sanitized = query.trim().toUpperCase();

      const vehicle = await Vehicle.findOne({
        $or: [{ vehicleId: sanitized }, { registrationNumber: sanitized }],
      });

      if (!vehicle) {
        res.status(404).json({
          success: false,
          verified: false,
          message: `No registered vehicle found matching '${sanitized}'. Record is invalid or unregistered.`,
        });
        return;
      }

      // Check on-chain record
      const onChainRecord = await BlockchainService.getVehicleOnChain(vehicle.vehicleId);
      const onChainHistory = await BlockchainService.getOwnershipHistoryOnChain(
        vehicle.vehicleId
      );

      // Mask owner wallet for public privacy (e.g., 0x1234...abcd)
      const maskedWallet = vehicle.currentOwnerWallet
        ? `${vehicle.currentOwnerWallet.slice(0, 6)}...${vehicle.currentOwnerWallet.slice(-4)}`
        : "Confidential";

      const sanitizedHistory = onChainHistory.map((h) => ({
        owner: `${h.owner.slice(0, 6)}...${h.owner.slice(-4)}`,
        transferTimestamp: h.transferTimestamp,
        transferRequestId: h.transferRequestId,
        documentHash: h.documentHash,
      }));

      res.status(200).json({
        success: true,
        verified: true,
        blockchainSynced: !!onChainRecord,
        data: {
          vehicleId: vehicle.vehicleId,
          registrationNumber: vehicle.registrationNumber,
          manufacturer: vehicle.manufacturer,
          model: vehicle.model,
          year: vehicle.year,
          vehicleType: vehicle.vehicleType,
          status: vehicle.status,
          currentOwnerMasked: maskedWallet,
          registrationTxHash: vehicle.registrationTxHash,
          initialDocHash: vehicle.initialDocHash,
          qrCodeDataUrl: vehicle.qrCodeDataUrl,
          registrationDate: vehicle.createdAt,
          ownershipHistory: sanitizedHistory,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Public verification failed", error: err.message });
    }
  }

  static async verifyHash(req: Request, res: Response): Promise<void> {
    try {
      const { vehicleId } = req.body;
      const file = req.file;

      if (!vehicleId || !file) {
        res.status(400).json({ success: false, message: "Vehicle ID and document file are required" });
        return;
      }

      const upperVehicleId = vehicleId.trim().toUpperCase();
      const vehicle = await Vehicle.findOne({ vehicleId: upperVehicleId });
      if (!vehicle) {
        res.status(404).json({ success: false, message: "Vehicle not found" });
        return;
      }

      const calculatedHash = StorageService.calculateSha256(file.buffer);
      const onChainValid = await BlockchainService.isDocumentHashValidOnChain(
        upperVehicleId,
        calculatedHash
      );
      const isMatch = onChainValid || calculatedHash.toLowerCase() === vehicle.initialDocHash.toLowerCase();

      res.status(200).json({
        success: true,
        verified: isMatch,
        calculatedHash,
        registeredHash: vehicle.initialDocHash,
        fileName: file.originalname,
        message: isMatch
          ? "Document Integrity Verified! SHA-256 matches blockchain immutable record."
          : "Document Integrity FAILED! The uploaded document does not match the registered cryptographic hash.",
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Hash verification failed", error: err.message });
    }
  }

  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const [totalVehicles, activeVehicles, suspendedVehicles, completedTransfers] =
        await Promise.all([
          Vehicle.countDocuments(),
          Vehicle.countDocuments({ status: "ACTIVE" }),
          Vehicle.countDocuments({ status: "SUSPENDED" }),
          TransferRequest.countDocuments({ status: "COMPLETED" }),
        ]);

      res.status(200).json({
        success: true,
        stats: {
          totalVehicles,
          activeVehicles,
          suspendedVehicles,
          completedTransfers,
          blockchainNetwork: "Hardhat Local / Ethereum Sepolia",
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Failed to fetch stats", error: err.message });
    }
  }
}
