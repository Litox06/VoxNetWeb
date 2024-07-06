import { Response } from "express";
import sequelize from "../config/database";
import { IGetUserAuthInfoRequest } from "../interfaces/cliente";
import { generateSalt, hashCredential } from "../utils/hash";

export const updateClientInfo = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  const { telefonoCliente, correoCliente, direccionCliente, newPassword } =
    req.body;
  const idCliente = req.userId;

  try {
    let hashedPassword = null;

    if (newPassword) {
      const salt = generateSalt();
      hashedPassword = hashCredential(newPassword, salt);
    }

    await sequelize.query(
      "CALL UpdateClient(:input_idCliente, :input_telefonoCliente, :input_correoCliente, :input_direccionCliente, :input_newPasswordCliente)",
      {
        replacements: {
          input_idCliente: idCliente,
          input_telefonoCliente: telefonoCliente || null,
          input_correoCliente: correoCliente || null,
          input_direccionCliente: direccionCliente || null,
          input_newPasswordCliente: hashedPassword,
        },
      }
    );

    res
      .status(200)
      .json({ message: "Información del cliente actualizada con éxito." });
  } catch (error) {
    console.error("Error actualizando la información del cliente:", error);
    res
      .status(500)
      .json({ message: "Error actualizando la información del cliente." });
  }
};
