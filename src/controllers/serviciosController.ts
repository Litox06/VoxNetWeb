import { Request, Response } from "express";
import sequelize from "../config/database";
import { IGetUserAuthInfoRequest } from "../interfaces/cliente";

export const subscribeToService = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  const { idServicio } = req.body;
  const idCliente = req.userId;

  try {
    // Calling the stored procedure
    const result = await sequelize.query(
      "CALL SubscribeToService(:idCliente, :idServicio)",
      {
        replacements: {
          idCliente,
          idServicio,
        },
      }
    );

    if (result) {
      return res.status(201).json({
        message: "Service added to invoice successfully",
        details: result,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Failed to add service to invoice" });
    }
  } catch (error) {
    console.error("Error subscribing to service:", error);
    res
      .status(500)
      .json({ message: "Server error during subscription process" });
  }
};
