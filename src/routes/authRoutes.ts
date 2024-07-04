import { Router } from "express";
import {
  register,
  login,
  requestPasswordReset,
  resetPassword,
} from "../controllers/clienteController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/request-password-reset", requestPasswordReset);
router.put("/reset-password", resetPassword);

export default router;
