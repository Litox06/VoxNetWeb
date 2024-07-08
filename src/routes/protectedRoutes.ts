import { Router, Response } from "express";
import { verifyToken } from "../middleware/auth";
import { IGetUserAuthInfoRequest } from "../interfaces/cliente";
import { updateClientInfo } from "../controllers/clienteController";
import {
  subscribeToService,
  subscribeToBundle,
  getSubscribedServices,
  updateServicePlan,
  getAllServices,
  cancelService,
  removeServiceFromFactura,
} from "../controllers/serviciosController";
import {
  comprarProducto,
  getAllProducts,
  removeProductoFromFactura,
} from "../controllers/productoController";
import { createCharge, getCharges, getClientCharges } from "../controllers/pagoController";

const router = Router();

router.use(verifyToken);

router.get("/", (req: IGetUserAuthInfoRequest, res: Response) => {
  res.status(200).json({
    message: `You have access to the client portal, userId: ${req.userId}`,
  });
});

// Update profile info route
router.put("/profile/update", updateClientInfo);

// Services routes
router.post("/services/subscribe", subscribeToService);
router.post("/services/subscribe-bundle", subscribeToBundle);
router.get("/services/subscribed", getSubscribedServices);
router.put("/services/update-plan", updateServicePlan);
router.get("/services/get-all", getAllServices);
router.delete("/services/cancel", cancelService);
router.delete("/services/remove", removeServiceFromFactura);

// Product routes
router.post("/products/buy", comprarProducto);
router.get("/products/get-all", getAllProducts);
router.delete("/products/remove", removeProductoFromFactura);

// Billing routes
router.get('/charges/client', getClientCharges);

// Checkout routers
router.post('/checkout/charge', createCharge);
router.get('/checkout/charges', getCharges); // History of payments made by client
export default router;
