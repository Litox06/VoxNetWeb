import { Response } from "express";
import sequelize from "../config/database";
import Cliente from "../models/cliente";
import { IGetUserAuthInfoRequest } from "../interfaces/cliente";
import { hashCredential } from "../utils/hash";

export const addPaymentMethod = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  const { numeroTarjeta, titularTarjeta, vencimiento, cvv } = req.body;
  const idCliente = req.userId;

  try {
    const cliente = await Cliente.findByPk(idCliente);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    const hashedNumeroTarjeta = hashCredential(numeroTarjeta);

    await sequelize.query(
      "CALL InsertMetodoPago(:numeroTarjeta, :titularTarjeta, :vencimiento, :cvv, :idCliente)",
      {
        replacements: {
          numeroTarjeta: hashedNumeroTarjeta,
          titularTarjeta,
          vencimiento,
          cvv,
          idCliente,
        },
      }
    );

    res.status(201).json({ message: "Método de pago agregado con éxito" });
  } catch (error) {
    console.error("Error agregando método de pago:", error);
    res.status(500).json({ message: "Error agregando método de pago" });
  }
};
