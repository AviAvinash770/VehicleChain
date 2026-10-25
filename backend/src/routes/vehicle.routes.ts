import { Router } from "express";
import multer from "multer";
import { VehicleController } from "../controllers/vehicle.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/rbac.middleware";
import { validateBody } from "../middleware/validator.middleware";
import { updateStatusSchema } from "../validators/vehicle.validator";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();

router.post(
  "/register",
  authenticate,
  authorizeRoles("AUTHORITY"),
  upload.single("document"),
  VehicleController.registerVehicle
);

router.get("/", authenticate, VehicleController.getVehicles);
router.get("/:id", authenticate, VehicleController.getVehicleById);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("AUTHORITY"),
  validateBody(updateStatusSchema),
  VehicleController.updateStatus
);

router.post(
  "/:id/verify-document",
  authenticate,
  upload.single("document"),
  VehicleController.verifyDocument
);

export default router;
