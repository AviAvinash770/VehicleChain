import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateBody } from "../middleware/validator.middleware";
import { registerSchema, loginSchema, linkWalletSchema } from "../validators/auth.validator";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", validateBody(registerSchema), AuthController.register);
router.post("/login", validateBody(loginSchema), AuthController.login);
router.get("/me", authenticate, AuthController.getMe);
router.post("/link-wallet", authenticate, validateBody(linkWalletSchema), AuthController.linkWallet);

export default router;
