import { z } from "zod";

export const registerVehicleSchema = z.object({
  vehicleId: z.string().min(3, "Vehicle ID required"),
  registrationNumber: z.string().min(4, "Registration number required"),
  vin: z.string().min(6, "VIN / Chassis number required"),
  manufacturer: z.string().min(2, "Manufacturer required"),
  model: z.string().min(1, "Model required"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 2),
  vehicleType: z.string().min(2, "Vehicle type required"),
  initialOwnerWallet: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid owner wallet address"),
  initialOwnerEmail: z.string().email().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "DEREGISTERED"]),
  reason: z.string().min(3, "Reason is required"),
});
