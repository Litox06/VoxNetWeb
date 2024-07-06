import { Response } from "express";
import sequelize from "../config/database";
import Cliente from "../models/clientes";
import { IGetUserAuthInfoRequest } from "../interfaces/cliente";
import { generateSalt, hashCredential } from "../utils/hash";

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

    const salt = generateSalt();
    const hashedNumeroTarjeta = hashCredential(numeroTarjeta, salt);

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

export const getPaymentMethods = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  const idCliente = req.userId;

  try {
    const results: any = await sequelize.query(
      "CALL GetPaymentMethods(:input_idCliente)",
      {
        replacements: { input_idCliente: idCliente },
      }
    );

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({ message: "Error fetching payment methods" });
  }
};

export const deletePaymentMethod = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  const { idMetodoPago } = req.params;
  const idCliente = req.userId;

  try {
    const [result]: [any[], unknown] = await sequelize.query(
      "CALL CheckMetodoPagoOwnership(:input_idMetodoPago, :input_idCliente)",
      {
        replacements: {
          input_idMetodoPago: idMetodoPago,
          input_idCliente: idCliente,
        },
      }
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: "Método de pago no encontrado o no pertenece al cliente",
      });
    }

    await sequelize.query("CALL DeleteMetodoPago(:input_idMetodoPago)", {
      replacements: { input_idMetodoPago: idMetodoPago },
    });

    res.status(200).json({ message: "Método de pago eliminado con éxito" });
  } catch (error) {
    console.error("Error eliminando método de pago:", error);
    res.status(500).json({ message: "Error eliminando método de pago" });
  }
};
