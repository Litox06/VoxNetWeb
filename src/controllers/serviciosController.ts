import { Request, Response } from "express";
import sequelize from "../config/database";
import { IGetUserAuthInfoRequest } from "../interfaces/cliente";

export const getAllServices = async (req: Request, res: Response) => {
  try {
    // Calling the stored procedure
    const result = await sequelize.query("CALL GetAllServices()");

    if (result) {
      return res.status(200).json({
        message: "Services retrieved successfully",
        services: result,
      });
    } else {
      return res.status(404).json({ message: "No services found" });
    }
  } catch (error) {
    console.error("Error retrieving services:", error);
    res.status(500).json({ message: "Server error during retrieval process" });
  }
};

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
  const { idServicios } = req.body;
  const idCliente = req.userId;

  try {
    // Ensure idServicios is an array and convert it to JSON
    if (!Array.isArray(idServicios) || idServicios.length < 2) {
      return res.status(400).json({
        message: "At least two services are required for a bundle subscription",
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

export const updateServicePlan = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  const { currentIdServicio, newIdServicio } = req.body;
  const idCliente = req.userId;

  try {
    const result = await sequelize.query(
      "CALL UpdateServicePlan(:idCliente, :currentIdServicio, :newIdServicio)",
      {
        replacements: {
          idCliente,
          currentIdServicio,
          newIdServicio,
        },
      }
    );

    if (result) {
      return res.status(200).json({
        message:
          "Service plan updated and billing details adjusted successfully",
        details: result,
      });
    } else {
      return res.status(400).json({ message: "Failed to update service plan" });
    }
  } catch (error) {
    console.error("Error updating service plan:", error);
    res.status(500).json({ message: "Server error during plan update" });
  }
};

export const cancelService = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  const { idServicio } = req.body;
  const idCliente = req.userId;

  try {
    // Calling the stored procedure
    const result = await sequelize.query(
      "CALL CancelService(:idCliente, :idServicio)",
      {
        replacements: {
          idCliente,
          idServicio,
        },
      }
    );

    if (result) {
      return res.status(200).json({
        message: "Service canceled and billing updated successfully",
        details: result,
      });
    } else {
      return res.status(400).json({
        message: "Failed to cancel service",
      });
    }
  } catch (error) {
    console.error("Error canceling service:", error);
    res
      .status(500)
      .json({ message: "Server error during service cancellation process" });
  }
};
