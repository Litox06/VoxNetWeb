import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IGetUserAuthInfoRequest } from "../interfaces/cliente";

export const verifyToken = (
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Assumes "Bearer TOKEN"
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: "Failed to authenticate token" });
    }

    req.userId = (decoded as any).idCliente;
    next();
  });
};
