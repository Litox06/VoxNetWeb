import { Router, Response } from "express";
import { verifyToken } from "../middleware/auth";
import { IGetUserAuthInfoRequest } from "../interfaces/cliente";
import {
  addPaymentMethod,
  deletePaymentMethod,
  getPaymentMethods,
} from "../controllers/metodoPagoController";

const router = Router();

router.use(verifyToken);

router.get("/protected", (req: IGetUserAuthInfoRequest, res: Response) => {
  res.status(200).json({
    message: `You have access to this protected route, userId: ${req.userId}`,
  });
});

// paymentMethod routes
router.post("/payment-methods/add", addPaymentMethod);
router.get("/payment-methods/get", getPaymentMethods);
router.delete("/payment-methods/delete/:idMetodoPago", deletePaymentMethod);

export default router;
