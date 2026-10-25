export type UserRole = "AUTHORITY" | "OWNER" | "BUYER" | "VERIFIER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletAddress?: string;
  phone?: string;
  department?: string;
}

export type VehicleStatus = "ACTIVE" | "SUSPENDED" | "DEREGISTERED";

export interface Vehicle {
  _id: string;
  vehicleId: string;
  registrationNumber: string;
  vin: string;
  vinHash: string;
  manufacturer: string;
  model: string;
  year: number;
  vehicleType: string;
  currentOwner: User | string;
  currentOwnerWallet: string;
  status: VehicleStatus;
  registrationTxHash: string;
  blockNumber?: number;
  initialDocHash: string;
  ipfsDocCID: string;
  qrCodeDataUrl?: string;
  statusChangeReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransferStatus =
  | "PENDING_BUYER"
  | "PENDING_AUTHORITY"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export interface TransferRequest {
  _id: string;
  onChainRequestId?: number;
  vehicle: Vehicle;
  vehicleId: string;
  registrationNumber: string;
  currentOwner: User;
  currentOwnerWallet: string;
  buyer: User;
  buyerWallet: string;
  buyerName?: string;
  buyerEmail?: string;
  status: TransferStatus;
  transferDocHash: string;
  ipfsDocCID: string;
  rejectionReason?: string;
  initiateTxHash?: string;
  buyerTxHash?: string;
  authorityTxHash?: string;
  salePrice?: number;
  agreementDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OwnershipRecord {
  owner: string;
  transferTimestamp: number;
  transferRequestId: number;
  documentHash: string;
}

export interface DocumentMetadata {
  _id: string;
  documentId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  sha256Hash: string;
  ipfsCID: string;
  uploadedBy: User | string;
  vehicleId?: string;
  docType: string;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string;
  vehicleId?: string;
  createdAt: string;
}
