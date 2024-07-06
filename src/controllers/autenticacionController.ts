import { Request, Response } from "express";
import sequelize from "../config/database";
import { generateSalt, hashCredential } from "../utils/hash";
import jwt from "jsonwebtoken";
import { abbreviateAddress } from "../utils/address";
import nodemailer from "nodemailer";
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

  const salt = generateSalt();
  const hashedPassword = hashCredential(password, salt);

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
    // Asignar directamente los resultados a Cliente
    const cliente = results as ICliente;

    if (!cliente) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const storedHashedPassword = cliente.passwordCliente;
    const salt = storedHashedPassword.slice(-8);
    const hashedPassword = hashCredential(password, salt);

    if (hashedPassword !== storedHashedPassword) {
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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const requestPasswordReset = async (
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

    const token = jwt.sign(
      { idCliente: cliente.idCliente, correoCliente: cliente.correoCliente },
      process.env.JWT_SECRET as string,
      { expiresIn: "30m" }
    );

    const mailOptions = {
      from: `"VoxNet Support" <${process.env.EMAIL_USER}>`,
      to: cliente.correoCliente,
      subject: "VoxNet Soporte: Instrucciones para Recuperar Contraseña",
      text: `Hola ${cliente.nombreCliente},

Hemos recibido una solicitud para restablecer tu contraseña de tu cuenta VoxNet. Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:

http://localhost:8080/reset-password/${token}

Este enlace expirará en 30 minutos. Si no solicitaste un restablecimiento de contraseña, por favor ignora este correo o contacta a nuestro equipo de soporte.

Gracias,
Equipo de Soporte de VoxNet`,
      html: `<p>Hola ${cliente.nombreCliente},</p>
<p>Hemos recibido una solicitud para restablecer tu contraseña de tu cuenta VoxNet. Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:</p>
<p><a href="http://localhost:8080/reset-password/${token}">Restablecer Contraseña</a></p>
<p>Este enlace expirará en 1 hora. Si no solicitaste un restablecimiento de contraseña, por favor ignora este correo o contacta a nuestro equipo de soporte.</p>
<p>Gracias,<br>Equipo de Soporte de VoxNet</p>
<p style="text-align:left;">
  <img src="cid:logo" alt="VoxNet Logo" style="width:500px;height:auto;"/>
</p>`,
      attachments: [
        {
          filename: "logo.png",
          path: "./assets/voxNetLogo.png",
          cid: "logo",
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error enviando email:", error);
        return res
          .status(500)
          .json({ message: "Error enviando correo de recuperación" });
      }
      res.status(200).json({ message: "Correo de recuperación enviado" });
    });
  } catch (error) {
    console.error("Error recuperando contraseña:", error);
    res.status(500).json({ message: "Error recuperando contraseña" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    // Verificar token y extraer payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      idCliente: number;
      correoCliente: string;
    };

    // Revisar payload descifrado
    if (!decoded.correoCliente) {
      throw new Error("Invalid token payload");
    }

    const salt = generateSalt();
    const hashedPassword = hashCredential(newPassword, salt);

    // Actualizar el password en la db usando el stored procedure
    await sequelize.query(
      "CALL UpdatePasswordCliente(:correo, :newPasswordCliente)",
      {
        replacements: {
          correo: decoded.correoCliente,
          newPasswordCliente: hashedPassword,
        },
      }
    );

    res.status(200).json({ message: "Contraseña actualizada." });
  } catch (error) {
    console.error("Error actualizando contraseña:", error);
    res.status(500).json({ message: "Error actualizando contraseña." });
  }
};
