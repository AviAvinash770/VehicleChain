import { Router } from "express";
import multer from "multer";
import { PublicController } from "../controllers/public.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.get("/verify/:query", PublicController.verifyVehicle);
router.post("/verify-hash", upload.single("document"), PublicController.verifyHash);
router.get("/stats", PublicController.getStats);

export default router;
