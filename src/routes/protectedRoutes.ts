import { Router, Response } from "express";
import { verifyToken } from "../middleware/auth";
import { IGetUserAuthInfoRequest } from "../interfaces/cliente";
import {
  addPaymentMethod,
  deletePaymentMethod,
  getPaymentMethods,
} from "../controllers/metodoPagoController";
import { updateClientInfo } from "../controllers/clienteController";
import { subscribeToService } from "../controllers/serviciosController";
import { subscribeToBundle } from "../controllers/serviciosBundleController";

const router = Router();

router.use(verifyToken);

router.get("/", (req: IGetUserAuthInfoRequest, res: Response) => {
  res.status(200).json({
    message: `You have access to the client portal, userId: ${req.userId}`,
  });
});

// Update profile info route
router.put("/profile/update", updateClientInfo);

// Payment method routes
router.post("/payment-methods/add", addPaymentMethod);
router.get("/payment-methods/get", getPaymentMethods);
router.delete("/payment-methods/delete/:idMetodoPago", deletePaymentMethod);

// Services routes
router.post("/services/subscribe", subscribeToService);
router.post("/services/subscribe-bundle", subscribeToBundle);

export default router;
