import Stripe from "../config/stripeConfig";
import sequelize from "../config/database";
import { Request, Response } from "express";
import { IGetUserAuthInfoRequest } from "../interfaces/cliente";

export const createCharge = async (req: Request, res: Response) => {
  const { amount, source, currency = "dop", idFactura } = req.body;

  try {
    // Convert the amount to centavos for Stripe
    const amountInCentavos = Math.round(Number(amount) * 100);

    // Retrieve the payment method details
    const paymentMethod = await Stripe.paymentMethods.retrieve(source);
    const last4 = paymentMethod.card?.last4;

    if (!last4) {
      throw new Error(
        "Unable to retrieve the last 4 digits of the payment method."
      );
    }

    const metodoPagoFactura = `${last4}`;

    console.log("Creating payment intent with data:", {
      amount: amountInCentavos,
      currency: currency,
      payment_method: source,
      description: "Factura para el producto/servicio de VoxNet",
      confirm: true,
      return_url: "http://localhost:3000/payment-confirmation",
      metadata: {
        idFactura,
        metodoPagoFactura,
      },
    });

    const paymentIntent = await Stripe.paymentIntents.create({
      amount: amountInCentavos, // amount in centavos
      currency: currency,
      payment_method: source,
      description: "Factura para el producto/servicio de VoxNet",
      confirm: true,
      return_url: "http://localhost:3000/payment-confirmation",
      metadata: {
        idFactura,
        metodoPagoFactura,
      },
    });

    console.log("Payment Intent created:", paymentIntent);

    // Call PayFactura procedure after successfully creating the payment intent
    const [results, metadata] = await sequelize.query(
      "CALL PayFactura(:input_idFactura, :input_metodoPagoFactura, :paymentAmount)",
      {
        replacements: {
          input_idFactura: idFactura,
          input_metodoPagoFactura: metodoPagoFactura,
          paymentAmount: amountInCentavos,
        },
      }
    );

    console.log("Stored procedure results:", results);

    return res.status(201).json({ success: true, paymentIntent, results });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create payment intent" });
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
