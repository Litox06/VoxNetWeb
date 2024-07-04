import { Router, Response } from "express";
import { verifyToken } from "../middleware/auth";
import { IGetUserAuthInfoRequest } from "../interfaces/cliente";
import {
  addPaymentMethod,
  // getPaymentMethods,
  // deletePaymentMethod,
} from "../controllers/metodoPagoController";

const router = Router();

router.use(verifyToken);

router.get("/protected", (req: IGetUserAuthInfoRequest, res: Response) => {
  res.status(200).json({
    message: `You have access to this protected route, userId: ${req.userId}`,
  });
});

// paymentMethod routes
router.post("/payment-methods", addPaymentMethod); 
// router.get("/payment-methods/:idCliente", getPaymentMethods); 
// router.delete("/payment-methods/:idMetodoPago", deletePaymentMethod);

export default router;
