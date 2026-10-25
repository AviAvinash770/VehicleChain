import { z } from "zod";

export const initiateTransferSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID required"),
  buyerWallet: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid buyer wallet address"),
  buyerEmail: z.string().email().optional(),
  buyerName: z.string().optional(),
  salePrice: z.coerce.number().optional(),
  agreementDate: z.string().optional(),
});

export const buyerResponseSchema = z.object({
  accept: z.boolean(),
  rejectionReason: z.string().optional(),
});

export const authorityResponseSchema = z.object({
  approve: z.boolean(),
  rejectionReason: z.string().optional(),
});
