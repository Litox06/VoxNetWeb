import { Request, Response } from "express";
import sequelize from "../config/database";
import { IGetUserAuthInfoRequest } from "../interfaces/cliente";

export const subscribeToBundle = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  const { idServicios } = req.body;
  const idCliente = req.userId;

  try {
    // Ensure idServicios is an array and convert it to JSON
    if (!Array.isArray(idServicios) || idServicios.length < 2) {
      return res
        .status(400)
        .json({
          message:
            "At least two services are required for a bundle subscription",
        });
    }
    const idServiciosJson = JSON.stringify(idServicios);

    const result = await sequelize.query(
      "CALL SubscribeToBundle(:idCliente, :idServicios)",
      {
        replacements: {
          idCliente,
          idServicios: idServiciosJson,
        },
      }
    );

    if (result) {
      return res.status(201).json({
        message: "Bundle subscription added to invoice successfully",
        details: result,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Failed to add bundle subscription to invoice" });
    }
  } catch (error) {
    console.error("Error subscribing to bundle:", error);
    res
      .status(500)
      .json({ message: "Server error during bundle subscription process" });
  }
};
