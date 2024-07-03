import { Request, Response } from "express";
import sequelize from "../config/database";
import { hashPassword } from "../utils/hash";
import jwt from "jsonwebtoken";
import { abbreviateAddress } from "../utils/address";
import {
  IRegisterRequest,
  IGetUserAuthInfoRequest,
  ICliente,
} from "../interfaces/cliente";

export const register = async (req: IRegisterRequest, res: Response) => {
  const {
    nombreCliente,
    direccion,
    sector,
    ciudad,
    provincia,
    telefonoCliente,
    correoCliente,
    cedulaCliente,
    password,
  } = req.body;
  const hashedPassword = hashPassword(password);

  // Abreviar la direccion
  const direccionCliente = abbreviateAddress(
    direccion,
    sector,
    ciudad,
    provincia
  );

  try {
    // Llamar al stored procedure para insertar un nuevo cliente
    await sequelize.query(
      "CALL InsertCliente(:nombreCliente, :direccionCliente, :telefonoCliente, :correoCliente, :cedulaCliente, :passwordCliente)",
      {
        replacements: {
          nombreCliente,
          direccionCliente,
          telefonoCliente,
          correoCliente,
          cedulaCliente,
          passwordCliente: hashedPassword,
        },
      }
    );
    res.status(201).json({ message: "Usuario registrado de manera exitosa" });
  } catch (error) {
    console.error("Error registrando usuario:", error);
    res.status(500).json({ message: "Error registrando usuario" });
  }
};

export const login = async (req: IGetUserAuthInfoRequest, res: Response) => {
  const { correoCliente, password } = req.body;

  try {
    // Llamar al stored procedure para seleccionar un cliente por correo
    const [results]: [any, unknown] = await sequelize.query(
      "CALL LoginCliente(:correo)",
      {
        replacements: { correo: correoCliente },
      }
    );
    // Asignar directamente los resultado a Cliente
    const cliente = results as ICliente;

    if (!cliente) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }
    const hashedPassword = hashPassword(password);
    if (hashedPassword !== cliente.passwordCliente) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { idCliente: cliente.idCliente },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Inicio de sesión exitoso", token });
  } catch (error) {
    console.error("Error iniciando sesión:", error);
    res.status(500).json({ message: "Error iniciando sesión" });
  }
};

export const recoverPassword = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  const { correoCliente } = req.body;

  try {
    // Llamar stored procedure para recuperar password
    const [results]: [any, unknown] = await sequelize.query(
      "CALL RecoverPasswordCliente(:correo)",
      {
        replacements: { correo: correoCliente },
      }
    );

    // Asignar resultados directamente al cliente
    const cliente = results as ICliente;

    if (!cliente) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({ message: "Correo de recuperación enviado" });
  } catch (error) {
    console.error("Error recuperando contraseña:", error);
    res.status(500).json({ message: "Error recuperando contraseña" });
  }
};
