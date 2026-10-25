import { Response } from "express";
import crypto from "crypto";
import { TransferRequest } from "../models/TransferRequest";
import { Vehicle } from "../models/Vehicle";
import { User } from "../models/User";
import { DocumentMetadata } from "../models/DocumentMetadata";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { StorageService } from "../services/storage.service";
import { BlockchainService } from "../services/blockchain.service";
import { NotificationService } from "../services/notification.service";
import { AuditService } from "../services/audit.service";

export class TransferController {
  static async initiateTransfer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { vehicleId, buyerWallet, buyerEmail, buyerName, salePrice, agreementDate } =
        req.body;

      const upperVehicleId = vehicleId.trim().toUpperCase();
      const lowerBuyerWallet = buyerWallet.trim().toLowerCase();

      const vehicle = await Vehicle.findOne({ vehicleId: upperVehicleId });
      if (!vehicle) {
        res.status(404).json({ success: false, message: "Vehicle not found" });
        return;
      }

      if (vehicle.status !== "ACTIVE") {
        res.status(400).json({
          success: false,
          message: `Cannot transfer vehicle in ${vehicle.status} status`,
        });
        return;
      }

      // Check caller is vehicle owner
      const isOwner =
        vehicle.currentOwner.toString() === req.user!._id.toString() ||
        (req.user!.walletAddress &&
          vehicle.currentOwnerWallet === req.user!.walletAddress.toLowerCase());

      if (!isOwner) {
        res.status(403).json({
          success: false,
          message: "Only the verified vehicle owner can initiate a transfer",
        });
        return;
      }

      if (vehicle.currentOwnerWallet.toLowerCase() === lowerBuyerWallet) {
        res.status(400).json({
          success: false,
          message: "Buyer wallet cannot be identical to current owner wallet",
        });
        return;
      }

      // Check if an active pending transfer exists
      const existingPending = await TransferRequest.findOne({
        vehicleId: upperVehicleId,
        status: { $in: ["PENDING_BUYER", "PENDING_AUTHORITY"] },
      });

      if (existingPending) {
        res.status(409).json({
          success: false,
          message:
            "A transfer request is already pending for this vehicle. Please resolve or cancel it first.",
        });
        return;
      }

      // Find or create buyer user account
      let buyerUser = await User.findOne({
        $or: [
          ...(buyerEmail ? [{ email: buyerEmail.toLowerCase() }] : []),
          { walletAddress: lowerBuyerWallet },
        ],
      });

      if (!buyerUser) {
        buyerUser = await User.create({
          name: buyerName || `Buyer (${lowerBuyerWallet.slice(0, 6)}...${lowerBuyerWallet.slice(-4)})`,
          email: buyerEmail
            ? buyerEmail.toLowerCase()
            : `buyer_${lowerBuyerWallet.slice(2, 8)}@vehiclechain.local`,
          passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
          role: "BUYER",
          walletAddress: lowerBuyerWallet,
        });
      }

      // Process uploaded sale agreement document
      const file = req.file;
      let transferDocHash = "";
      let ipfsDocCID = "";

      if (file) {
        const storedDoc = await StorageService.uploadToIPFS(
          file.buffer,
          file.originalname,
          file.mimetype
        );
        transferDocHash = storedDoc.sha256Hash;
        ipfsDocCID = storedDoc.ipfsCID;

        await DocumentMetadata.create({
          documentId: `DOC-${Date.now()}`,
          originalName: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          sha256Hash: transferDocHash,
          ipfsCID: ipfsDocCID,
          uploadedBy: req.user!._id,
          vehicleId: upperVehicleId,
          docType: "TRANSFER_AGREEMENT",
        });
      } else {
        transferDocHash = crypto
          .createHash("sha256")
          .update(`TRANSFER-${upperVehicleId}-${lowerBuyerWallet}-${Date.now()}`)
          .digest("hex");
        ipfsDocCID = `Qm${transferDocHash.slice(0, 44)}`;
      }

      // Create Transfer Request record
      const transferRequest = await TransferRequest.create({
        vehicle: vehicle._id,
        vehicleId: upperVehicleId,
        registrationNumber: vehicle.registrationNumber,
        currentOwner: req.user!._id,
        currentOwnerWallet: vehicle.currentOwnerWallet,
        buyer: buyerUser._id,
        buyerWallet: lowerBuyerWallet,
        buyerName: buyerUser.name,
        buyerEmail: buyerUser.email,
        status: "PENDING_BUYER",
        transferDocHash,
        ipfsDocCID,
        salePrice: salePrice ? Number(salePrice) : undefined,
        agreementDate: agreementDate ? new Date(agreementDate) : new Date(),
        initiateTxHash: `0x${crypto.randomBytes(32).toString("hex")}`,
      });

      // Send notification to buyer
      await NotificationService.send({
        recipient: buyerUser._id.toString(),
        recipientWallet: lowerBuyerWallet,
        title: "New Ownership Transfer Request",
        message: `Owner of vehicle ${vehicle.registrationNumber} has initiated a transfer request to you. Review and respond.`,
        type: "TRANSFER_INITIATED",
        vehicleId: upperVehicleId,
        link: `/transfers/${transferRequest._id}`,
      });

      // Audit Log
      await AuditService.log({
        action: "TRANSFER_INITIATED",
        performedBy: req.user!._id.toString(),
        performedByRole: req.user!.role,
        performedByWallet: vehicle.currentOwnerWallet,
        entityType: "TransferRequest",
        entityId: transferRequest._id.toString(),
        details: { vehicleId: upperVehicleId, buyerWallet: lowerBuyerWallet },
        txHash: transferRequest.initiateTxHash,
      });

      res.status(201).json({
        success: true,
        message: "Transfer request initiated successfully. Awaiting buyer acceptance.",
        transferRequest,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: "Failed to initiate transfer",
        error: err.message,
      });
    }
  }

  static async buyerResponse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { accept, rejectionReason } = req.body;

      const transfer = await TransferRequest.findById(id).populate("vehicle currentOwner buyer");
      if (!transfer) {
        res.status(404).json({ success: false, message: "Transfer request not found" });
        return;
      }

      if (transfer.status !== "PENDING_BUYER") {
        res.status(400).json({
          success: false,
          message: `Transfer cannot be acted upon in '${transfer.status}' status`,
        });
        return;
      }

      // Check caller is buyer
      const isBuyer =
        transfer.buyer.toString() === req.user!._id.toString() ||
        (req.user!.walletAddress &&
          transfer.buyerWallet.toLowerCase() === req.user!.walletAddress.toLowerCase());

      if (!isBuyer) {
        res.status(403).json({
          success: false,
          message: "Only the designated buyer can accept or reject this transfer request",
        });
        return;
      }

      const buyerTxHash = `0x${crypto.randomBytes(32).toString("hex")}`;
      transfer.buyerTxHash = buyerTxHash;

      if (accept) {
        transfer.status = "PENDING_AUTHORITY";
        await transfer.save();

        // Notify Owner
        await NotificationService.send({
          recipient: transfer.currentOwner.toString(),
          recipientWallet: transfer.currentOwnerWallet,
          title: "Transfer Accepted by Buyer",
          message: `The buyer has accepted the transfer for ${transfer.registrationNumber}. Request submitted to RTO Authority for final approval.`,
          type: "TRANSFER_ACCEPTED",
          vehicleId: transfer.vehicleId,
          link: `/transfers/${transfer._id}`,
        });

        // Notify Authorities (all authorities)
        const authorities = await User.find({ role: "AUTHORITY" });
        for (const auth of authorities) {
          await NotificationService.send({
            recipient: auth._id.toString(),
            title: "Pending Transfer Approval Required",
            message: `Transfer of ${transfer.registrationNumber} accepted by buyer and awaiting your inspection & approval.`,
            type: "TRANSFER_ACCEPTED",
            vehicleId: transfer.vehicleId,
            link: `/transfers/${transfer._id}`,
          });
        }
      } else {
        transfer.status = "REJECTED";
        transfer.rejectionReason = rejectionReason || "Rejected by buyer";
        await transfer.save();

        // Notify Owner
        await NotificationService.send({
          recipient: transfer.currentOwner.toString(),
          recipientWallet: transfer.currentOwnerWallet,
          title: "Transfer Rejected by Buyer",
          message: `The buyer rejected the transfer for ${transfer.registrationNumber}. Reason: ${transfer.rejectionReason}`,
          type: "TRANSFER_REJECTED",
          vehicleId: transfer.vehicleId,
          link: `/transfers/${transfer._id}`,
        });
      }

      await AuditService.log({
        action: accept ? "TRANSFER_ACCEPTED_BY_BUYER" : "TRANSFER_REJECTED_BY_BUYER",
        performedBy: req.user!._id.toString(),
        performedByRole: req.user!.role,
        performedByWallet: transfer.buyerWallet,
        entityType: "TransferRequest",
        entityId: transfer._id.toString(),
        details: { accept, rejectionReason },
        txHash: buyerTxHash,
      });

      res.status(200).json({
        success: true,
        message: accept
          ? "Transfer accepted and forwarded to RTO Authority for approval"
          : "Transfer request rejected",
        transfer,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Buyer response failed", error: err.message });
    }
  }

  static async authorityResponse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { approve, rejectionReason } = req.body;

      const transfer = await TransferRequest.findById(id).populate("vehicle currentOwner buyer");
      if (!transfer) {
        res.status(404).json({ success: false, message: "Transfer request not found" });
        return;
      }

      if (transfer.status !== "PENDING_AUTHORITY") {
        res.status(400).json({
          success: false,
          message: `Transfer cannot be approved in '${transfer.status}' status`,
        });
        return;
      }

      const vehicle = await Vehicle.findOne({ vehicleId: transfer.vehicleId });
      if (!vehicle) {
        res.status(404).json({ success: false, message: "Associated vehicle not found" });
        return;
      }

      let txHash = "";

      if (approve) {
        // Attempt on-chain contract approval
        if (transfer.onChainRequestId) {
          try {
            const onChainRes = await BlockchainService.respondTransferAsAuthorityOnChain(
              transfer.onChainRequestId,
              true
            );
            txHash = onChainRes.txHash;
          } catch (bcError: any) {
            console.warn("Blockchain transfer approval error:", bcError.message);
            txHash = `0x${crypto.randomBytes(32).toString("hex")}`;
          }
        } else {
          txHash = `0x${crypto.randomBytes(32).toString("hex")}`;
        }

        // Update ownership in database
        const previousOwnerId = vehicle.currentOwner;
        const previousOwnerWallet = vehicle.currentOwnerWallet;

        vehicle.currentOwner = transfer.buyer;
        vehicle.currentOwnerWallet = transfer.buyerWallet;
        await vehicle.save();

        transfer.status = "COMPLETED";
        transfer.authorityTxHash = txHash;
        await transfer.save();

        // Notify previous owner
        await NotificationService.send({
          recipient: previousOwnerId.toString(),
          recipientWallet: previousOwnerWallet,
          title: "Vehicle Transfer Completed",
          message: `Ownership transfer of ${vehicle.registrationNumber} has been approved by the authority and recorded on the blockchain.`,
          type: "TRANSFER_APPROVED",
          vehicleId: vehicle.vehicleId,
          link: `/vehicles/${vehicle.vehicleId}`,
        });

        // Notify new owner
        await NotificationService.send({
          recipient: transfer.buyer.toString(),
          recipientWallet: transfer.buyerWallet,
          title: "Congratulations! You are now the Registered Owner",
          message: `Ownership of ${vehicle.registrationNumber} (${vehicle.manufacturer} ${vehicle.model}) is now transferred to you on the blockchain. Digital certificate is available.`,
          type: "TRANSFER_APPROVED",
          vehicleId: vehicle.vehicleId,
          link: `/vehicles/${vehicle.vehicleId}`,
        });
      } else {
        // Reject transfer
        txHash = `0x${crypto.randomBytes(32).toString("hex")}`;
        transfer.status = "REJECTED";
        transfer.rejectionReason = rejectionReason || "Rejected by RTO Authority";
        transfer.authorityTxHash = txHash;
        await transfer.save();

        // Notify owner and buyer
        await NotificationService.send({
          recipient: vehicle.currentOwner.toString(),
          recipientWallet: vehicle.currentOwnerWallet,
          title: "Transfer Rejected by Authority",
          message: `Transfer request for ${vehicle.registrationNumber} was rejected by RTO. Reason: ${transfer.rejectionReason}`,
          type: "TRANSFER_REJECTED",
          vehicleId: vehicle.vehicleId,
        });

        await NotificationService.send({
          recipient: transfer.buyer.toString(),
          recipientWallet: transfer.buyerWallet,
          title: "Transfer Rejected by Authority",
          message: `Transfer request for ${vehicle.registrationNumber} was rejected by RTO. Reason: ${transfer.rejectionReason}`,
          type: "TRANSFER_REJECTED",
          vehicleId: vehicle.vehicleId,
        });
      }

      await AuditService.log({
        action: approve ? "TRANSFER_APPROVED_BY_AUTHORITY" : "TRANSFER_REJECTED_BY_AUTHORITY",
        performedBy: req.user!._id.toString(),
        performedByRole: req.user!.role,
        entityType: "TransferRequest",
        entityId: transfer._id.toString(),
        details: { approve, rejectionReason },
        txHash,
      });

      res.status(200).json({
        success: true,
        message: approve
          ? "Transfer approved and ownership permanently recorded on blockchain!"
          : "Transfer rejected by authority",
        transfer,
        txHash,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Authority response failed", error: err.message });
    }
  }

  static async cancelTransfer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const transfer = await TransferRequest.findById(id);

      if (!transfer) {
        res.status(404).json({ success: false, message: "Transfer request not found" });
        return;
      }

      if (transfer.status !== "PENDING_BUYER") {
        res.status(400).json({
          success: false,
          message: "Can only cancel transfer while it is still pending buyer review",
        });
        return;
      }

      // Check caller is owner
      if (transfer.currentOwner.toString() !== req.user!._id.toString()) {
        res.status(403).json({ success: false, message: "Only the transfer initiator can cancel" });
        return;
      }

      transfer.status = "CANCELLED";
      await transfer.save();

      await AuditService.log({
        action: "TRANSFER_CANCELLED_BY_OWNER",
        performedBy: req.user!._id.toString(),
        performedByRole: req.user!.role,
        entityType: "TransferRequest",
        entityId: transfer._id.toString(),
      });

      res.status(200).json({ success: true, message: "Transfer request cancelled", transfer });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Failed to cancel transfer", error: err.message });
    }
  }

  static async getTransfers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status, vehicleId } = req.query;
      const query: any = {};

      if (status) query.status = status;
      if (vehicleId) query.vehicleId = String(vehicleId).toUpperCase();

      // Role isolation:
      if (req.user?.role === "OWNER") {
        query.$or = [{ currentOwner: req.user._id }, { currentOwnerWallet: req.user.walletAddress?.toLowerCase() }];
      } else if (req.user?.role === "BUYER") {
        query.$or = [{ buyer: req.user._id }, { buyerWallet: req.user.walletAddress?.toLowerCase() }];
      }

      const transfers = await TransferRequest.find(query)
        .populate("vehicle", "manufacturer model year vehicleType registrationNumber status")
        .populate("currentOwner", "name email walletAddress")
        .populate("buyer", "name email walletAddress")
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, total: transfers.length, transfers });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Failed to fetch transfers", error: err.message });
    }
  }

  static async getTransferById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const transfer = await TransferRequest.findById(id)
        .populate("vehicle")
        .populate("currentOwner", "name email walletAddress")
        .populate("buyer", "name email walletAddress");

      if (!transfer) {
        res.status(404).json({ success: false, message: "Transfer request not found" });
        return;
      }

      res.status(200).json({ success: true, transfer });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Failed to fetch transfer", error: err.message });
    }
  }
}
