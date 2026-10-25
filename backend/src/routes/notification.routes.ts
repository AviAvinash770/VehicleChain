import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, NotificationController.getNotifications);
router.patch("/:id/read", authenticate, NotificationController.markRead);
router.patch("/read-all", authenticate, NotificationController.markAllRead);

export default router;
