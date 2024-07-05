import { Router, Response } from "express";
import { verifyToken } from "../middleware/auth";
import { IGetUserAuthInfoRequest } from "../interfaces/cliente";
import {
  addPaymentMethod,
  deletePaymentMethod,
  getPaymentMethods,
} from "../controllers/metodoPagoController";
import { updateClientInfo } from "../controllers/clienteController";

const router = Router();

router.use(verifyToken);

router.get("/", (req: IGetUserAuthInfoRequest, res: Response) => {
  res.status(200).json({
    message: `You have access to the client portal, userId: ${req.userId}`,
  });
});

// payment method routes
router.post("/payment-methods/add", addPaymentMethod);
router.get("/payment-methods/get", getPaymentMethods);
router.delete("/payment-methods/delete/:idMetodoPago", deletePaymentMethod);

// update client info route
router.put("/profile/update", updateClientInfo);
export default router;
