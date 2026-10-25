import { Router } from "express";
import multer from "multer";
import { TransferController } from "../controllers/transfer.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/rbac.middleware";
import { validateBody } from "../middleware/validator.middleware";
import {
  buyerResponseSchema,
  authorityResponseSchema,
} from "../validators/transfer.validator";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.post(
  "/initiate",
  authenticate,
  authorizeRoles("OWNER"),
  upload.single("agreement"),
  TransferController.initiateTransfer
);

router.post(
  "/:id/buyer-response",
  authenticate,
  authorizeRoles("BUYER", "OWNER"),
  validateBody(buyerResponseSchema),
  TransferController.buyerResponse
);

router.post(
  "/:id/authority-response",
  authenticate,
  authorizeRoles("AUTHORITY"),
  validateBody(authorityResponseSchema),
  TransferController.authorityResponse
);

router.post(
  "/:id/cancel",
  authenticate,
  authorizeRoles("OWNER"),
  TransferController.cancelTransfer
);

router.get("/", authenticate, TransferController.getTransfers);
router.get("/:id", authenticate, TransferController.getTransferById);

export default router;
