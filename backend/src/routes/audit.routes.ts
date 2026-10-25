import { Router } from "express";
import { AuditController } from "../controllers/audit.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/rbac.middleware";

const router = Router();

router.get("/logs", authenticate, authorizeRoles("AUTHORITY"), AuditController.getLogs);

export default router;
