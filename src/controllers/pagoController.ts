import Stripe from "../config/stripeConfig";
import sequelize from "../config/database";
import { Request, Response } from "express";
import { IGetUserAuthInfoRequest } from "../interfaces/cliente";
import Factura from "../models/facturas";
import Contrato from "../models/contratos";

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

    const paymentIntent = await Stripe.paymentIntents.create({
      amount: amountInCentavos, // amount in centavos
      currency: currency,
      payment_method: source,
      description: "Factura para el producto/servicio de VoxNet",
      confirm: true,
      return_url: "http://localhost:8080/payment-confirmation",
      metadata: {
        idFactura,
        metodoPagoFactura,
      },
    });

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
    const updateResults = await updateClientCharges(idCliente);
    const charges = await sequelize.query(
      "CALL GetClientCharges(:input_idCliente)",
      {
        replacements: { input_idCliente: idCliente },
      }
    );
    return res.status(200).json({ success: true, charges, updateResults });
  } catch (error) {
    console.error("Error retrieving client charges:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to retrieve charges" });
  }
};

export const updateClientCharges = async (idCliente: any) => {
  try {
    // Fetch the latest factura for the client
    const latestFactura = await Factura.findOne({
      where: { idCliente: idCliente },
      order: [["createdAt", "DESC"]],
    });

    if (!latestFactura) {
      throw new Error("No factura found for client.");
    }

    // Fetch all contracts for a client
    const contracts = await Contrato.findAll({
      where: { idCliente: idCliente },
    });

    let totalAdditionalFee = 0;

    const updates = contracts.map(async (contract) => {
      if (contract.feeApplied) {
        return {
          contractId: contract.idContrato,
          newStatus: contract.estadoContrato,
          feeApplied: 0,
        };
      }

      let updatedStatus = contract.estadoContrato;
      let additionalFee = 0;

      switch (contract.estadoContrato) {
        case "Pendiente de Activación: Pago Requerido":
          break;
        case "Activo: Pago Pendiente":
          break;
        case "Activo: Pago Atrasado":
          additionalFee = latestFactura.totalFactura * 0.07;
          updatedStatus = "Activo: Pago Atrasado";
          break;
        case "Inactivo: Pago Vencido":
          additionalFee = latestFactura.totalFactura * 0.15;
          updatedStatus = "Inactivo: Pago Vencido";
          break;
        default:
          break;
      }

      totalAdditionalFee += additionalFee;

      if (contract.estadoContrato !== updatedStatus || additionalFee > 0) {
        await contract.update({
          estadoContrato: updatedStatus,
          feeApplied: true,
          updatedAt: new Date(),
        });
      }

      return {
        contractId: contract.idContrato,
        newStatus: updatedStatus,
        feeApplied: additionalFee,
      };
    });

    const results = await Promise.all(updates);

    if (totalAdditionalFee > 0) {
      const newTotalFactura =
        Number(latestFactura.totalFactura) + totalAdditionalFee;

      await latestFactura.update({
        totalFactura: newTotalFactura,
        updatedAt: new Date(),
      });
    }
    return results;
  } catch (error: any) {
    console.error("Error updating client charges:", error);
    throw new Error("Failed to update client charges");
  }
};
