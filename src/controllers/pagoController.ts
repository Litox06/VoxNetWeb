import Stripe from "../config/stripeConfig";
import sequelize from "../config/database";
import { Request, Response } from "express";
import { IGetUserAuthInfoRequest } from "../interfaces/cliente";

export const createCharge = async (req: Request, res: Response) => {
  const {
    amount,
    source,
    currency = "dop",
    idFactura,
    idMetodoPago,
  } = req.body;

  try {
    const charge = await Stripe.charges.create({
      amount: amount,
      currency: currency,
      source: source,
      description: "Factura para el producto/servicio de VoxNet",
    });

    // Call PayFactura procedure after successfully creating the charge
    await sequelize.query(
      "CALL PayFactura(:input_idFactura, :input_idMetodoPago, :paymentAmount)",
      {
        replacements: {
          input_idFactura: idFactura,
          input_idMetodoPago: idMetodoPago,
          paymentAmount: amount
        },
      }
    );

    return res.status(201).json({ success: true, charge });
  } catch (error) {
    console.error("Error creating charge:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create charge" });
  }
};

export const getCharges = async (req: Request, res: Response) => {
  try {
    const charges = await Stripe.charges.list();
    return res.status(200).json({ success: true, charges });
  } catch (error) {
    console.error("Error retrieving charges:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve charges" });
  }
};

export const getClientCharges = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  const idCliente = req.userId;

  try {
    const charges = await sequelize.query(
      "CALL GetClientCharges(:input_idCliente)",
      {
        replacements: { input_idCliente: idCliente },
      }
    );
    return res.status(200).json({ success: true, charges });
  } catch (error) {
    console.error("Error retrieving client charges:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve charges" });
  }
};
