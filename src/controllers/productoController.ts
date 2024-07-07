import sequelize from "../config/database";
import { Response } from "express";
import { IGetUserAuthInfoRequest } from "../interfaces/cliente";

export const comprarProducto = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  const { idProducto } = req.body;
  const idCliente = req.userId;
  try {
    // Calling the stored procedure
    const result = await sequelize.query(
      "CALL ComprarProducto(:idCliente, :idProducto)",
      {
        replacements: {
          idCliente,
          idProducto,
        },
      }
    );

    return res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error purchasing product:", error);
    res.status(500).json({ message: "Server error during purchase process" });
  }
};
