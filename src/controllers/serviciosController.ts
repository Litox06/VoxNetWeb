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

export const subscribeToBundle = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  const { idServicios } = req.body; // expecting an array of service IDs
  const idCliente = req.userId;

  try {
    // Calling the stored procedure
    const result = await sequelize.query(
      "CALL SubscribeToBundle(:idCliente, :idServicios)",
      {
        replacements: {
          idCliente,
          idServicios: idServicios.join(","),
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

export const getSubscribedServices = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  const idCliente = req.userId;

  try {
    const result = await sequelize.query(
      "CALL GetSubscribedServices(:idCliente)",
      {
        replacements: { idCliente },
      }
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching subscribed services:", error);
    return res
      .status(500)
      .json({ message: "Server error fetching subscribed services" });
  }
};

