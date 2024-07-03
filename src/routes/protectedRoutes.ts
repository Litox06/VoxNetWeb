import { Router, Response } from "express";
import { verifyToken } from "../middleware/auth";
import { IGetUserAuthInfoRequest } from "../interfaces/cliente";

const router = Router();

router.use(verifyToken);

router.get("/protected", (req: IGetUserAuthInfoRequest, res: Response) => {
  res
    .status(200)
    .json({
      message: `You have access to this protected route, userId: ${req.userId}`,
    });
});

export default router;
